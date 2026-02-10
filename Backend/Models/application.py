from extensions import db

class Application(db.Model):
    __tablename__ = "applications"
    id = db.Column(db.Integer, primary_key=True)
    applicant_id = db.Column(db.Integer, db.ForeignKey("applicants.id"), nullable=False, index=True)
    job_id = db.Column(db.Integer, db.ForeignKey("jobs.id"), nullable=False, index=True)
    status = db.Column(db.String(50), default="pending")
    score = db.Column(db.Float)

    publisher_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True, index=True)

    applicant = db.relationship("Applicant", back_populates="applications")
    job = db.relationship("Job", back_populates="applications")
    publisher = db.relationship("User", back_populates="received_applications")
