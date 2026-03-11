from backend.database import SessionLocal, engine
from backend import models

def seed():
    # Create tables
    models.Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if JD already exists
        jd = db.query(models.JobDescription).first()
        if not jd:
            jd = models.JobDescription(
                title="Senior React Developer",
                description_text="""
                We are seeking a highly motivated and experienced Project Manager to oversee our team.
                Requirements:
                - 5+ years of experience in React and modern JavaScript.
                - Strong experience with state management (Redux, Zustand, etc.).
                - Familiarity with Tailwind CSS and Framer Motion.
                - Experience with Backend integration (Python/Node.js).
                - Excellent communication and leadership skills.
                """,
                requirements="React, TypeScript, Tailwind, 5+ years exp"
            )
            db.add(jd)
            db.commit()
            print("Database seeded with 'Senior React Developer' JD (ID: 1)")
        else:
            print(f"JD already exists: {jd.title} (ID: {jd.id})")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
