import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError
from dotenv import load_dotenv


## Load the environment variable
load_dotenv()


# Fetch db url value from the loaded enviroment variables
DATABASE_URL = os.getenv("DATABASE_URL")


if not DATABASE_URL:
    print("ERROR: DATABASE_URL not found!")
    sys.exit(1)


# create database engine and session
try:
    engine = create_engine(DATABASE_URL)

    with engine.connect() as connection:
        print("Database Connected Successfully!")

    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

except OperationalError as e:
    print("ERROR: Could not connect to the database")
    print("Please check your password, port (5432), and ensure PostgreSQL is running in pgAdmin.")
    print(f"Technical details: {e}")
    sys.exit(1)



def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
