from flask import Blueprint, request, jsonify
from extensions import db
from Models.application import Application
from Models.job import Job
from Models.applicant import Applicant
from services import score_computing

apply_bp = Blueprint("apply", __name__, url_prefix="/apply")

@apply_bp.post("/<int:job_id>")
def apply_to_job(job_id):
    data = request.get_json() or {}
    user_id = data.get("applicant_id")
    if not user_id:
        return jsonify({"error": "applicant_id is required"}), 400

    job = Job.query.get(job_id)
    if not job:
        return jsonify({"error": "Job not found"}), 404

    applicant = Applicant.query.filter_by(user_id=user_id).first()
    if not applicant:
        return jsonify({"error": "Applicant not found"}), 404

    application = Application(
        job_id=job.id,
        applicant_id=applicant.id,
        status=data.get("status", "pending"),
    )
    db.session.add(application)
    db.session.flush()
    application.publisher_id = job.publisher_id
    application.score = score_computing.compute_application_score(applicant.id, job.id)
    db.session.commit()

    return jsonify({
        "id": application.id,
        "job_id": application.job_id,
        "applicant_id": application.applicant_id,
        "publisher_id": application.publisher_id,
        "status": application.status,
        "score": application.score
    }), 201

@apply_bp.route("/user/<int:user_id>", methods=["GET"])
def get_applications_for_applicant(user_id):
    applicant = Applicant.query.filter_by(user_id=user_id).first()
    if not applicant:
        return jsonify({"error": "Applicant not found"}), 404
    applications = Application.query.filter_by(applicant_id=applicant.id).all()
    if not applications:
        return jsonify({"error": "No applications found for this applicant"}), 404

    result = [
        {
            "id": app.id,
            "job_id": app.job_id,
            "description": Job.query.get(app.job_id).description if Job.query.get(app.job_id) else None,
            "job_title": Job.query.get(app.job_id).title if Job.query.get(app.job_id) else None,
            "publisher_id": app.publisher_id,
            "applicant_name": applicant.name,
            "status": app.status,
            "score": app.score,
        }
        for app in applications
    ]

    return jsonify(result), 200

@apply_bp.route("/publisher/<int:publisher_id>", methods=["GET"])
def get_applications_for_publisher(publisher_id):
    applications = Application.query.filter_by(publisher_id=publisher_id).all()
    if not applications:
        return jsonify({"error": "No applications found for this publisher"}), 404

    result = []
    for app in applications:
        job = Job.query.get(app.job_id)
        applicant = Applicant.query.get(app.applicant_id)
        result.append({
            "id": app.id,
            "job_id": app.job_id,
            "job_title": job.title if job else None,
            "job_description": job.description if job else None,
            "applicant_id": applicant.id if applicant else None,
            "applicant_name": applicant.name if applicant else None,
            "status": app.status,
            "score": app.score,
        })

    return jsonify(result), 200
