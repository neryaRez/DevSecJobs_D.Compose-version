# applicant table
from enum import unique

from extensions import db

class Applicant(db.Model):
    __tablename__ = "applicants"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), unique=True , nullable=True, index=True)

    name = db.Column(db.String(200),nullable=False)
    languages = db.Column(db.Text)          # "Python, Bash, Go"
    technologies = db.Column(db.Text)       # "AWS, Docker, Kubernetes"
    flagship_project = db.Column(db.Text)
    last_job = db.Column(db.String(200))
    education = db.Column(db.Text)
    years_experience = db.Column(db.Integer)
    resume_path = db.Column(db.Text)        # CV file path

    applications = db.relationship("Application", back_populates="applicant", cascade="all, delete-orphan")
    user = db.relationship("User", back_populates="applicants")