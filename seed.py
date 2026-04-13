import sys
import os
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend"))
import backend.database as database
import backend.models as models
import backend.auth as auth

def main():
    db = database.SessionLocal()
    email = "a-mawaddah@suikime.com"
    password = "123456"
    
    user = db.query(models.User).filter(models.User.email == email).first()
    if user:
        print(f"User {email} already exists. Updating role to Admin and updating password...")
        user.role = "Admin"
        user.hashed_password = auth.get_password_hash(password)
        db.commit()
    else:
        print(f"Creating user {email} as Admin...")
        hashed_password = auth.get_password_hash(password)
        new_user = models.User(email=email, hashed_password=hashed_password, role="Admin")
        db.add(new_user)
        db.commit()
        
    print("Done!")

if __name__ == "__main__":
    main()
