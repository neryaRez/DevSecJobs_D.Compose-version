# Routers/auth_router.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt, get_jwt_identity
)
from extensions import db
from Models.user import User

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

@auth_bp.post("/register")
def register():
    data = request.get_json() or {}
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    if not all([username, email, password]):
        return jsonify({"error": "username, email, password are required"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already in use"}), 409

    is_admin = bool(data.get("is_admin", False))
    user = User(username=username, email=email, is_admin=is_admin)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    applicant_id = None
    # If the user is not an admin, create an associated Applicant record
    if not is_admin:
        from Models.applicant import Applicant
        applicant = Applicant(user_id=user.id, name=username)
        db.session.add(applicant)
        db.session.commit()
        applicant_id = applicant.id

    claims = {"user_id": user.id, "is_admin": user.is_admin}
    access = create_access_token(identity=user.email, additional_claims=claims)
    refresh = create_refresh_token(identity=user.email, additional_claims=claims)
    return jsonify({
        "user": {"id": user.id, "username": user.username, "email": user.email, "is_admin": user.is_admin, "applicant_id": applicant_id},
        "access_token": access,
        "refresh_token": refresh
    }), 201

@auth_bp.post("/login")
def login():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")
    if not all([email, password]):
        return jsonify({"error": "email and password are required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid credentials"}), 401

    claims = {"user_id": user.id, "is_admin": user.is_admin}
    access = create_access_token(identity=user.email, additional_claims=claims)
    refresh = create_refresh_token(identity=user.email, additional_claims=claims)
    return jsonify({
        "user": {"id": user.id, "username": user.username, "email": user.email, "is_admin": user.is_admin, "applicant_id": user.applicants.id if user.applicants else None},
        "access_token": access, "refresh_token": refresh
    }), 200

@auth_bp.post("/refresh")
@jwt_required(refresh=True)
def refresh():
    claims = get_jwt()
    identity = claims.get("sub")
    new_access = create_access_token(identity=identity, additional_claims={
        "user_id": claims.get("user_id"),
        "is_admin": claims.get("is_admin", False)
    })
    return jsonify({"access_token": new_access}), 200

@auth_bp.get("/me")
@jwt_required()
def me():
    claims = get_jwt()
    user_id = claims.get("user_id")
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "email": claims.get("sub"),
        "user_id": user_id,
        "is_admin": claims.get("is_admin", False),
        "applicant_id": user.applicants.id if user.applicants else None
    }), 200

