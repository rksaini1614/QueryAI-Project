from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from pydantic import BaseModel
from database import get_db


# Initialize fastapi app
app = FastAPI(
    title="QueryAI API",
    description="Backend for Natural Language to SQL Analytics",
    version="1.0"
)

# define the request schema
class QueryRequest(BaseModel):
    user_query: str


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
        print(f"User asked : {request.user_query}")
        test_sql = "SELECT * FROM customers LIMIT 2;"
        result = db.execute(text(test_sql))
        data = [dict(row._mapping) for row in result]
        
        return {
            "status" : "success",
            "user_input" : request.user_query,
            "sql_executed" : test_sql,
            "result" : data
        }

    except SQLAlchemyError as e:
        raise HTTPException(status_code=500,detail=f"Database execution failed: {str(e)}")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")