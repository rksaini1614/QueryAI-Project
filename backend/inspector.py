from sqlalchemy import create_engine, inspect
from sqlalchemy.exc import SQLAlchemyError

def extract_schema(db_url: str) -> str:
    """Connects to an external database and extracts its table and column structures."""
    try:
        # Create a temporary connection to the target database
        target_engine = create_engine(db_url)
        inspector = inspect(target_engine)
        
        schema_text = []
        
        # Loop through every table in the database
        for table_name in inspector.get_table_names():
            columns = []
            # Extract column names and their data types
            for column in inspector.get_columns(table_name):
                columns.append(f"{column['name']} ({column['type']})")
                
            schema_text.append(f"Table: {table_name}\nColumns: {', '.join(columns)}\n")
            
        return "\n".join(schema_text)
        
    except SQLAlchemyError as e:
        raise Exception(f"Failed to connect or inspect the database. Check your credentials. Details: {str(e)}")