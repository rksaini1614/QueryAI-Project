from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from pydantic import BaseModel
from openai import OpenAI
import os
from database import get_db


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

# define the request schema
class QueryRequest(BaseModel):
    user_query: str


# Propmt Engineering : The schema
DB_SCHEMA = """
Database: ecommerce
Tables:
1. customers (customer_id, name, city)
2. products (product_id, product_name, category, price)
3. orders (order_id, customer_id, order_date, ampount)
"""

def generate_sql_from_text(user_query: str) -> str:
    """Calls the LLM to translate English into SQL."""

    system_prompt = f"""
    You are an expert PostgreSQL developer. 
    Convert the user's natural language question into a valid PostgreSQL query.
    
    Here is the database schema:
    {DB_SCHEMA}
    
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


# Health check endpoint (GET)
@app.get("/")
def health_check():
    return {
        "status" : "success", 
        "message" : "QueryAI API is up and running!"
    }


# Query endpoint (POST)
@app.post("/query")
async def execute_query(request: QueryRequest, db: Session = Depends(get_db)):
    try:
        #print(f"User asked : {request.user_query}")
        #test_sql = "SELECT * FROM customers LIMIT 2;"

        # Send english query to the LLM and get SQL back
        generated_sql = generate_sql_from_text(request.user_query)
        print(f"Generated SQL: {generated_sql}")

        result = db.execute(text(generated_sql))
        data = [dict(row._mapping) for row in result]
        
        return {
            "status" : "success",
            "user_input" : request.user_query,
            "sql_executed" : generated_sql,
            "result" : data
        }

    except SQLAlchemyError as e:
        raise HTTPException(status_code=500,detail=f"Database execution failed: {str(e)}")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")