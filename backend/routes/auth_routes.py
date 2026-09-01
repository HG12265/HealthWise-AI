from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from bson import ObjectId
from db import get_collection
from datetime import datetime

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "").strip()

    if not name or not email or not password:
        return jsonify({
            "success": False,
            "message": "Name, email, and password are required."
        }), 400

    try:
        users_collection = get_collection("users")
        if not users_collection:
            return jsonify({
                "success": False,
                "message": "Database connection error. Please try again later."
            }), 500

        # Check if email already exists
        existing_user = users_collection.find_one({"email": email})
        if existing_user:
            return jsonify({
                "success": False,
                "message": "An account with this email already exists."
            }), 409

        # Hash password and insert
        hashed_pw = generate_password_hash(password)
        new_user = {
            "name": name,
            "email": email,
            "password_hash": hashed_pw,
            "created_at": datetime.utcnow()
        }
        result = users_collection.insert_one(new_user)
        user_id = str(result.inserted_id)

        return jsonify({
            "success": True,
            "message": "User registered successfully.",
            "data": {
                "id": user_id,
                "name": name,
                "email": email
            }
        }), 201

    except Exception as e:
        print(f"Registration Error: {e}")
        return jsonify({
            "success": False,
            "message": f"Registration Error: {str(e)}"
        }), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "").strip()

    if not email or not password:
        return jsonify({
            "success": False,
            "message": "Email and password are required."
        }), 400

    try:
        users_collection = get_collection("users")
        if not users_collection:
            return jsonify({
                "success": False,
                "message": "Database connection error. Please try again later."
            }), 500

        user = users_collection.find_one({"email": email})

        if not user or not check_password_hash(user["password_hash"], password):
            return jsonify({
                "success": False,
                "message": "Invalid email or password."
            }), 401

        return jsonify({
            "success": True,
            "message": "Login successful.",
            "data": {
                "id": str(user["_id"]),
                "name": user["name"],
                "email": user["email"]
            }
        }), 200

    except Exception as e:
        print(f"Login Error: {e}")
        return jsonify({
            "success": False,
            "message": f"Login Error: {str(e)}"
        }), 500

