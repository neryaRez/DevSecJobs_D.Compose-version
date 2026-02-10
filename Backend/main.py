import os
from datetime import timedelta
import pymysql
from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from sqlalchemy import inspect
from extensions import db

from Routers.job_router import jobs_bp
from Routers.applicant_router import applicants_bp
from Routers.application_router import apply_bp
from Routers.users_router import users_bp
from Routers.auth_router import auth_bp

from Models import Job, Applicant, Application, User  # noqa: F401


load_dotenv()


def bool_env(name: str, default: str = "0") -> bool:
    return os.getenv(name, default).strip().lower() in ("1", "true", "yes")


def int_env(name: str, default: str) -> int:
    try:
        return int(os.getenv(name, default))
    except ValueError:
        return int(default)


def mysql_uri() -> str:
    """
    Expected in .env:
    DATABASE_URL=mysql+pymysql://user:pass@host:3306/dbname?charset=utf8mb4
    """
    db_url = os.getenv("DATABASE_URL", "").strip()
    if not db_url:
        raise RuntimeError("DATABASE_URL is required (MySQL). Example: mysql+pymysql://user:pass@localhost:3306/db?charset=utf8mb4")

    if not db_url.startswith("mysql"):
        raise RuntimeError(f"DATABASE_URL must be a MySQL URL. Got: {db_url}")

    return db_url


def init_security_and_cors(app: Flask):
    jwt_secret = os.getenv("JWT_SECRET_KEY", "").strip()
    if not jwt_secret and os.getenv("FLASK_ENV", "development") != "development":
        raise RuntimeError("JWT_SECRET_KEY is required in non-development environments")

    app.config["JWT_SECRET_KEY"] = jwt_secret or "dev-only-super-secret"
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(
        minutes=int_env("JWT_ACCESS_EXPIRES_MIN", "60")
    )
    app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(
        days=int_env("JWT_REFRESH_EXPIRES_DAYS", "7")
    )
    app.config["JWT_TOKEN_LOCATION"] = ["headers"]
    app.config["JWT_ALGORITHM"] = "HS256"

    origins_raw = os.getenv("CORS_ORIGINS", "*").strip()
    if origins_raw == "*" or not origins_raw:
        origins = "*"
    else:
        origins = [o.strip() for o in origins_raw.split(",") if o.strip()]

    CORS(app, resources={r"/*": {"origins": origins}}, supports_credentials=False)

    jwt = JWTManager(app)

    @jwt.unauthorized_loader
    def unauthorized_loader(msg):
        return {"error": "Missing or invalid token", "detail": msg}, 401

    @jwt.invalid_token_loader
    def invalid_token_loader(msg):
        return {"error": "Invalid token", "detail": msg}, 422

    return jwt


def create_app() -> Flask:
    app = Flask(__name__, instance_relative_config=True)

    # ✅ MySQL instead of SQLite
    app.config["SQLALCHEMY_DATABASE_URI"] = mysql_uri()
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # ✅ recommended for MySQL connections
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
        "pool_pre_ping": True,
        "pool_recycle": 280,
    }

    db.init_app(app)

    init_security_and_cors(app)

    app.register_blueprint(jobs_bp, url_prefix="/jobs")
    app.register_blueprint(applicants_bp, url_prefix="/applicants")
    app.register_blueprint(apply_bp, url_prefix="/apply")
    app.register_blueprint(users_bp, url_prefix="/users")
    app.register_blueprint(auth_bp, url_prefix="/auth")

    with app.app_context():
        db.create_all()
        print(">>> Tables now:", inspect(db.engine).get_table_names())

    @app.get("/health")
    def health():
        return {"ok": True}, 200

    @app.route("/")
    def homepage():
        return "hello"

    return app


if __name__ == "__main__":
    app = create_app()
    debug = bool_env("FLASK_DEBUG", "0")
    port = int_env("PORT", "5001")
    app.run(host="0.0.0.0", debug=debug, port=port)
