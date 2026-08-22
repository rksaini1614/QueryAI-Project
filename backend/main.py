from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import text, create_engine
from sqlalchemy.exc import SQLAlchemyError
from pydantic import BaseModel
from openai import OpenAI
import os
from database import get_db, engine
import models
from auth import get_password_hash, verify_password, create_access_token, get_current_user
from datetime import timedelta
from inspector import extract_schema


# Automatically create tables in the database if they don't exist
models.Base.metadata.create_all(bind=engine)


# Initialize fastapi app
app = FastAPI(
    title="QueryAI API",
    description="Backend for Natural Language to SQL Analytics",
    version="1.0"
)


# Initialize the OpenAI client
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENAI_API_KEY")
)


# define the requests schema
class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class DBConnectionCreate(BaseModel):
    connection_name: str
    db_url: str

class QueryRequest(BaseModel):
    connection_id: int
    user_query: str


# Propmt Engineering : The schema
# DB_SCHEMA = """
# Database: ecommerce
# Tables:
# 1. customers (customer_id, name, city)
# 2. products (product_id, product_name, category, price)
# 3. orders (order_id, customer_id, order_date, ampount)
# """

def generate_sql_from_text(user_query: str, schema_text:str) -> str:
    """Calls the LLM to translate English into SQL."""

    system_prompt = f"""
    You are an expert PostgreSQL developer. 
    Convert the user's natural language question into a valid PostgreSQL query.
    
    Here is the database schema:
    {schema_text}
    
    Rules:
    1. ONLY return the SQL query, nothing else. No explanations.
    2. Do not wrap the SQL in markdown formatting (like ```sql ... ```). Just the raw SQL string.
    3. Use JOINs if necessary.
    """

    response = client.chat.completions.create(
        model="openai/gpt-3.5-turbo",
        messages=[
            {"role" : "system", "content":system_prompt},
            {"role":"user","content":user_query}
        ],
        temperature=0
    )

    return response.choices[0].message.content.strip()


# Create the Safety Layer
def is_safe_query(sql_query:str) -> bool:
    """Checks if the SQL query is safe to execute (read-only)."""

    sql_upper = sql_query.upper()

    forbidden_keywords = [
        "DELETE", "UPDATE", "INSERT", "DROP", "ALTER", 
        "TRUNCATE", "CREATE", "GRANT", "REVOKE"
    ] 

    for keyword in forbidden_keywords:
        if f"{keyword}" in f"{sql_upper}":
            return False

    return True


# Health check endpoint (GET)
@app.get("/")
def health_check():
    return {
        "status" : "success", 
        "message" : "QueryAI API is up and running!"
    }


# Auth Endpoints
# Register User
@app.post("/register", response_model=Token)
def register_user(user:UserCreate, db: Session=Depends(get_db)):
    db_user = db.query(models.User).filter(
        (models.User.username == user.username) | (models.User.email == user.email)
    ).first()

    if db_user:
        raise HTTPException(status_code=400, detail="Username or email already registered")

    # Create new user
    hashed_password = get_password_hash(user.password)
    new_user = models.User(
        username = user.username,
        email = user.email,
        password_hash= hashed_password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # generate token 
    access_token_expires = timedelta(minutes=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES",30)))
    access_token = create_access_token(
        data={"sub":new_user.username},
        expires_delta=access_token_expires
    )

    return {
        "access_token" : access_token,
        "token_type": "bearer"
    }

# Login User
@app.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Find user
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    
    # Verify password
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # Generate token
    access_token_expires = timedelta(minutes=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30)))
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# Protected endpoint
@app.get("/me")
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email
    }


# Database connection endpoint
@app.post("/connections")
def connect_database(conn_data: DBConnectionCreate, db: Session=Depends(get_db), current_user: models.User = Depends(get_current_user)):
    try:
        print(print(f"Attempting to inspect database for user {current_user.username}..."))
        extracted_schema = extract_schema(conn_data.db_url)


        new_conn = models.DBConnection(
            user_id=current_user.id,
            connection_name=conn_data.connection_name,
            db_url=conn_data.db_url,
            schema_cache=extracted_schema
        )

        db.add(new_conn)
        db.commit()
        db.refresh(new_conn)

        return {
            "status": "success",
            "message": f"Successfully connected to '{conn_data.connection_name}' and extracted schema.",
            "connection_id": new_conn.id,
            "schema_preview": extracted_schema
        }

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Could not connect or inspect the database. Error: {str(e)}"
        )


# Query endpoint (POST)
@app.post("/query")
async def execute_query(request: QueryRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    try:
        #print(f"User asked : {request.user_query}")
        #test_sql = "SELECT * FROM customers LIMIT 2;"

        # Verify the connection belongs to this user
        connection = db.query(models.DBConnection).filter(
            models.DBConnection.id == request.connection_id,
            models.DBConnection.user_id == current_user.id
        ).first()

        if not connection:
            raise HTTPException(
                status_code=404, 
                detail="Database connection not found."
            )

        # Send english query to the LLM and get SQL back
        generated_sql = generate_sql_from_text(request.user_query, connection.schema_cache)
        print(f"Generated SQL: {generated_sql}")

        # safety check 
        if not is_safe_query(generated_sql):
            failed_history = models.QueryHistory(
                user_id=current_user.id, 
                connection_id=connection.id,
                user_prompt=request.user_query, 
                generated_sql=generated_sql, 
                status="BLOCKED"
            )
            db.add(failed_history)
            db.commit()

            raise HTTPException(
                status_code=403,
                detail=f"Security Alert: The generated query attempts to modify the database. Only SELECT queries are allowed. Query blocked: {generated_sql}"
            )

        # Execute on the target database
        target_engine = create_engine(connection.db_url)
        with target_engine.connect() as target_conn:
            result = target_conn.execute(text(generated_sql))
            data = [dict(row._mapping) for row in result]

        # Log the succesful query to history
        success_history = models.QueryHistory(
            user_id=current_user.id, 
            connection_id=connection.id,
            user_prompt=request.user_query, 
            generated_sql=generated_sql, 
            status="SUCCESS"
        )
        db.add(success_history)
        db.commit()
        
        return {
            "status" : "success",
            "user_input" : request.user_query,
            "sql_executed" : generated_sql,
            "result" : data
        }
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        error_history = models.QueryHistory(
            user_id=current_user.id, connection_id=request.connection_id,
            user_prompt=request.user_query, generated_sql=generated_sql, status="ERROR"
        )
        db.add(error_history)
        db.commit()

        raise HTTPException(
            status_code=500,
            detail=f"Target database execution failed: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")



# Query History Endpoint
@app.get("/history")
def get_query_history(limit: int = 10, db: Session = Depends(get_db),current_user: models.User = Depends(get_current_user)):
    try:
        # Fetch the user's history, ordered by newest first
        history = db.query(models.QueryHistory).filter(
            models.QueryHistory.user_id == current_user.id
        ).order_by(models.QueryHistory.created_at.desc()).limit(limit).all()
        
        history_list = []
        for item in history:
            history_list.append({
                "id": item.id,
                "connection_id": item.connection_id,
                "user_prompt": item.user_prompt,
                "generated_sql": item.generated_sql,
                "status": item.status,
                "created_at": item.created_at
            })
            
        return {
            "status": "success",
            "history": history_list
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch history: {str(e)}")