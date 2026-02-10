from extensions import db
from werkzeug.security import generate_password_hash, check_password_hash
#טבלת משתמשים למערכת
class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)

    applicants = db.relationship("Applicant", back_populates="user", uselist=False)

    published_jobs = db.relationship("Job", back_populates="publisher", cascade="all, delete-orphan")
    received_applications = db.relationship("Application", back_populates="publisher", cascade="all, delete-orphan")

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)