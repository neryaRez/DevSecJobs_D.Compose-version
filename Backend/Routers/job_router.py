from flask import Blueprint, request, jsonify

from Models import User
from extensions import db
from Models.job import Job
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from services.auth_utils import admin_required

jobs_bp = Blueprint("jobs", __name__, url_prefix="/jobs")

@jobs_bp.get('/')
@jwt_required()
def list_jobs():
    claims = get_jwt()
    is_admin = claims.get("is_admin", False)
    user_id = claims.get("user_id")
    # Admin can see only the jobs he published,
    # regular users can see all jobs
    if is_admin:
        rows = Job.query.filter_by(publisher_id=user_id).all()
    else:
        rows = Job.query.all()
    return jsonify([
        {
            "id": j.id,
            "title": j.title,
            "employment_type": j.employment_type,
            "work_location": j.work_location,
            "description": j.description,
            "required_technologies": j.required_technologies,
            "required_experience": j.required_experience,
            "is_open": j.is_open
        } for j in rows
    ]), 200

@jobs_bp.get("/<int:id>")    #Get job by id
def get_by_id(id):
    job = Job.query.get(id)  # fetch by primary key
    if not job:
        return jsonify({"error": "The job doesn't exist"}), 404

    return jsonify({
        "id": job.id,
        "title": job.title,
        "employment_type": job.employment_type,
        "work_location": job.work_location,
        "description": job.description,
        "required_technologies": job.required_technologies,
        "required_experience": job.required_experience,
        "is_open": job.is_open
    }), 200


@jobs_bp.put("/<int:id>")
def update_job_by_id(id):
    job = Job.query.get(id)
    if not job:
        return jsonify({"error": "Job not found"}), 404

    data = request.get_json() or {}

    # Update fields if they exist in the model
    if "title" in data:
        job.title = data["title"]
    if "employment_type" in data:
        job.employment_type = data["employment_type"]
    if "work_location" in data:
        job.work_location = data["work_location"]
    if "description" in data:
        job.description = data["description"]
    if "required_technologies" in data:
        job.required_technologies = data["required_technologies"]
    if "required_experience" in data:
        job.required_experience = data["required_experience"]
    if "is_open" in data:
        job.is_open = bool(data["is_open"])

    db.session.commit()

    return jsonify({
        "id": job.id,
        "title": job.title,
        "employment_type": job.employment_type,
        "work_location": job.work_location,
        "description": job.description,
        "required_technologies": job.required_technologies,
        "required_experience": job.required_experience,
        "is_open": job.is_open,
        "message": "Job updated successfully"
    }), 200

@jobs_bp.route("/", methods=["POST"])
@jwt_required()
@admin_required
def create_job():
    data = request.get_json() or {}
    if isinstance(data, list):
        jobs = []
        for item in data:
            if not item.get("title"):
                return jsonify({"error": "Title is required"}), 400
            job = Job(**item)
            jobs.append(job)
        db.session.add_all(jobs)
        db.session.commit()
        return jsonify([{"id": j.id, "title": j.title} for j in jobs]), 201
    else:
        if not data.get("title"):
            return jsonify({"error": "Title is required"}), 400
        job = Job(**data)
        db.session.add(job)
        db.session.commit()
        return jsonify({"id": job.id, "title": job.title}), 201

@jobs_bp.delete("/<int:id>")
@jwt_required()
@admin_required
def delete_by_id(id):
    job = Job.query.get(id)  # fetch by primary key
    if not job:
        return jsonify({"error": "The job doesn't exist"}), 404
    db.session.delete(job)
    db.session.commit()
    return jsonify({"status": "Done", "message": f"Job {id} deleted!"}), 200

