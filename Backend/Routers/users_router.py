from flask import Blueprint, request, jsonify
from extensions import db
from Models.user import User

users_bp = Blueprint("users", __name__, url_prefix="/users")

@users_bp.route('/', methods=['GET'])
def list_users():
    rows = User.query.order_by(User.id.desc()).all()
    return jsonify([
        {
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "is_admin": u.is_admin
        } for u in rows
    ]), 200

@users_bp.route('/<int:id>', methods=['GET'])    #Get user by id
def get_user_by_id(id):
    user = User.query.get(id)  # fetch by primary key
    if not user:
        return jsonify({"error": "The user doesn't exist"}), 404
    return jsonify({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "is_admin": user.is_admin
    }), 200

@users_bp.route('/<int:id>', methods=['PUT'])
def update_user_by_id(id):
    user = User.query.get(id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json() or {}

    # Update fields if they exist in the model
    if "username" in data:
        user.username = data["username"]
    if "email" in data:
        user.email = data["email"]
    if "is_admin" in data:
        if data["is_admin"] in [True, False]:
            user.is_admin = data["is_admin"]

    db.session.commit()

    return jsonify({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "is_admin": user.is_admin
    }), 200

@users_bp.route('/<int:id>', methods=['DELETE'])
def delete_user_by_id(id):
    user = User.query.get(id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    db.session.delete(user)
    db.session.commit()

    return jsonify({"message": "User deleted successfully"}), 200

@users_bp.route('/', methods=['POST'])
def create_user():
    data = request.get_json() or {}

    if isinstance(data, list):
        users = []
        for item in data:
            if not all(key in item for key in ("username", "email")):
                return jsonify({"error": "Missing required fields"}), 400
            user = User(
                username=item["username"],
                email=item["email"],
                is_admin=item.get("is_admin", False),
                password_hash=item.get("password_hash", "default_hash")
            )
            db.session.add(user)
            users.append(user)
        db.session.commit()
        return jsonify([{
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "is_admin": u.is_admin
        } for u in users]), 201
    else:
        if not all(key in data for key in ("username", "email")):
            return jsonify({"error": "Missing required fields"}), 400
        user = User(
            username=data["username"],
            email=data["email"],
            is_admin=data.get("is_admin", False),
            password_hash=data.get("password_hash", "default_hash")
        )
        db.session.add(user)
        db.session.commit()
        return jsonify({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "is_admin": user.is_admin
        }), 201


