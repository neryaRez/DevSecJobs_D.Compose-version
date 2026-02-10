# auth_utils.py
from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt

def admin_required(fn):
    """Decorator that ensures the requester is an admin."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        claims = get_jwt()
        if not claims.get("is_admin", False):
            return jsonify({"error": "Admins only"}), 403
        return fn(*args, **kwargs)
    return wrapper
