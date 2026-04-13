import sys
import os

# Add backend to path so we can import models and database
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import User
from dotenv import load_dotenv

def main():
    # Load environment variables
    load_dotenv()
    db_url = os.environ.get("DATABASE_URL")
    
    if not db_url:
        print("Error: DATABASE_URL not found in .env file")
        return

    print("Connecting to the database...")
    engine = create_engine(db_url)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    try:
        email = 'a-mawaddah@suikime.com'
        user = db.query(User).filter(User.email == email).first()
        
        if user:
            print(f"User found: {user.email}. Current role: {user.role}")
            user.role = 'Admin'
            db.commit()
            print("Successfully updated user role to Admin!")
        else:
            print(f"Error: User with email {email} not found in the database.")
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    main()
