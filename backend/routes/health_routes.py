from flask import Blueprint, request, jsonify
from services.bmi_service import calculate_bmi
from db import get_collection
from bson import ObjectId
from datetime import datetime

health_bp = Blueprint("health", __name__, url_prefix="/api")

# System health status endpoint
@health_bp.route("/system/health", methods=["GET"])
@health_bp.route("/health", methods=["GET"])
def system_health():
    return jsonify({
        "success": True,
        "message": "HealthWise-AI backend is running"
    }), 200

# Standalone BMI calculation endpoint
@health_bp.route("/bmi", methods=["POST"])
def compute_bmi():
    data = request.get_json(silent=True) or {}
    height = data.get("height")
    weight = data.get("weight")

    if height is None or weight is None:
        return jsonify({
            "success": False,
            "message": "Both height and weight are required."
        }), 400

    try:
        bmi_result = calculate_bmi(height, weight)
        return jsonify({
            "success": True,
            "message": "BMI calculated successfully.",
            "data": bmi_result
        }), 200
    except ValueError as ve:
        return jsonify({
            "success": False,
            "message": str(ve)
        }), 400
    except Exception as e:
        return jsonify({
            "success": False,
            "message": "An error occurred while calculating BMI."
        }), 500

def validate_bp(systolic_bp, diastolic_bp):
    """
    Validates systolic_bp and diastolic_bp parameters.
    Returns (sys_val, dia_val, error_message).
    """
    if systolic_bp is None and diastolic_bp is None:
        return None, None, None

    if (systolic_bp is None and diastolic_bp is not None) or (systolic_bp is not None and diastolic_bp is None):
        return None, None, "Both systolic and diastolic blood pressure values must be supplied together."

    try:
        sys_val = int(systolic_bp)
        dia_val = int(diastolic_bp)
    except (ValueError, TypeError):
        return None, None, "Systolic and diastolic blood pressure must be valid numeric integers."

    if sys_val <= 0 or dia_val <= 0:
        return None, None, "Systolic and diastolic blood pressure values must be greater than zero."

    if sys_val <= dia_val:
        return None, None, "Systolic blood pressure must be greater than diastolic blood pressure."

    return sys_val, dia_val, None

# User Health Record Endpoints
@health_bp.route("/health", methods=["POST"])
def create_health_record():
    data = request.get_json(silent=True) or {}
    user_id = data.get("user_id")
    age = data.get("age")
    gender = data.get("gender", "male")
    height = data.get("height")
    weight = data.get("weight")
    systolic_bp_raw = data.get("systolic_bp") if data.get("systolic_bp") is not None else data.get("systolic")
    diastolic_bp_raw = data.get("diastolic_bp") if data.get("diastolic_bp") is not None else data.get("diastolic")
    smoking_status = data.get("smoking_status", "non-smoker")
    physical_activity = data.get("physical_activity", "moderate")
    health_conditions = data.get("health_conditions", "none")
    goal = data.get("goal")

    # Input validations
    if age is None or height is None or weight is None:
        return jsonify({
            "success": False,
            "message": "age, height, and weight are required fields."
        }), 400

    try:
        age_val = int(age)
        if age_val < 0:
            return jsonify({"success": False, "message": "Age cannot be negative."}), 400
    except (ValueError, TypeError):
        return jsonify({"success": False, "message": "Age must be a valid integer."}), 400

    sys_bp, dia_bp, bp_err = validate_bp(systolic_bp_raw, diastolic_bp_raw)
    if bp_err:
        return jsonify({"success": False, "message": bp_err}), 400

    try:
        bmi_info = calculate_bmi(height, weight)
        bmi_val = bmi_info["bmi"]
    except ValueError as ve:
        return jsonify({"success": False, "message": str(ve)}), 400

    try:
        health_records_collection = get_collection("health_records")
        if health_records_collection is None:
            return jsonify({"success": False, "message": "Database connection error."}), 500

        # Create health record document
        health_record = {
            "user_id": user_id,
            "age": age_val,
            "gender": str(gender),
            "height": float(height),
            "weight": float(weight),
            "bmi": bmi_val,
            "systolic_bp": sys_bp,
            "diastolic_bp": dia_bp,
            "smoking_status": str(smoking_status),
            "physical_activity": str(physical_activity),
            "health_conditions": str(health_conditions),
            "goal": str(goal) if goal and str(goal) != "" else None,
            "created_at": datetime.utcnow()
        }

        result = health_records_collection.insert_one(health_record)
        record_id = str(result.inserted_id)

        return jsonify({
            "success": True,
            "message": "Health record saved successfully.",
            "data": {
                "id": record_id,
                "user_id": user_id,
                "age": age_val,
                "gender": gender,
                "height": float(height),
                "weight": float(weight),
                "bmi": bmi_val,
                "bmi_category": bmi_info["category"],
                "systolic_bp": sys_bp,
                "diastolic_bp": dia_bp,
                "smoking_status": smoking_status,
                "physical_activity": physical_activity,
                "health_conditions": health_conditions,
                "goal": goal
            }
        }), 201

    except Exception as err:
        print(f"Error saving health record: {err}")
        return jsonify({
            "success": False,
            "message": "Error saving health record."
        }), 500

@health_bp.route("/health/<user_id>", methods=["GET"])
def get_user_health(user_id):
    try:
        health_records_collection = get_collection("health_records")
        if health_records_collection is None:
            return jsonify({
                "success": False,
                "message": "Database connection unavailable."
            }), 500

        # Find all health records for user, sorted by creation date (newest first)
        records = list(health_records_collection.find(
            {"user_id": user_id}
        ).sort("created_at", -1))

        # Convert ObjectId and datetime to strings for JSON serialization
        for rec in records:
            rec["_id"] = str(rec["_id"])
            if rec.get("created_at"):
                rec["created_at"] = rec["created_at"].isoformat()

        return jsonify({
            "success": True,
            "user_id": user_id,
            "count": len(records),
            "data": records
        }), 200

    except Exception as e:
        print(f"Error fetching health records for user {user_id}: {e}")
        return jsonify({
            "success": False,
            "message": "Error retrieving health records."
        }), 500

@health_bp.route("/health/<user_id>", methods=["PUT"])
def update_user_health(user_id):
    data = request.get_json(silent=True) or {}
    record_id = data.get("record_id")
    age = data.get("age")
    gender = data.get("gender")
    height = data.get("height")
    weight = data.get("weight")
    systolic_bp_raw = data.get("systolic_bp") if data.get("systolic_bp") is not None else data.get("systolic")
    diastolic_bp_raw = data.get("diastolic_bp") if data.get("diastolic_bp") is not None else data.get("diastolic")
    smoking_status = data.get("smoking_status")
    physical_activity = data.get("physical_activity")
    health_conditions = data.get("health_conditions")
    goal = data.get("goal")

    if height is not None and float(height) <= 0:
        return jsonify({"success": False, "message": "Height must be greater than zero."}), 400
    if weight is not None and float(weight) <= 0:
        return jsonify({"success": False, "message": "Weight must be greater than zero."}), 400
    if age is not None and int(age) < 0:
        return jsonify({"success": False, "message": "Age cannot be negative."}), 400

    try:
        health_records_collection = get_collection("health_records")
        if health_records_collection is None:
            return jsonify({"success": False, "message": "Database connection unavailable."}), 500

        # Get the latest record if record_id not provided
        if not record_id:
            latest_record = health_records_collection.find_one(
                {"user_id": user_id},
                sort=[("created_at", -1)]
            )
            if not latest_record:
                return jsonify({"success": False, "message": "No existing health record found for this user."}), 404
            record_id = str(latest_record["_id"])
        else:
            latest_record = health_records_collection.find_one({"_id": ObjectId(record_id)})
            if not latest_record:
                return jsonify({"success": False, "message": "Health record not found."}), 404

        # Build update fields
        new_age = int(age) if age is not None else latest_record["age"]
        new_gender = str(gender) if gender is not None else latest_record["gender"]
        new_height = float(height) if height is not None else latest_record["height"]
        new_weight = float(weight) if weight is not None else latest_record["weight"]
        new_smoking = str(smoking_status) if smoking_status is not None else latest_record["smoking_status"]
        new_activity = str(physical_activity) if physical_activity is not None else latest_record["physical_activity"]
        new_conditions = str(health_conditions) if health_conditions is not None else latest_record["health_conditions"]
        new_goal = str(goal) if goal is not None and str(goal) != "" else latest_record.get("goal")

        if systolic_bp_raw is not None or diastolic_bp_raw is not None:
            sys_to_check = systolic_bp_raw if systolic_bp_raw is not None else latest_record["systolic_bp"]
            dia_to_check = diastolic_bp_raw if diastolic_bp_raw is not None else latest_record["diastolic_bp"]
            sys_bp, dia_bp, bp_err = validate_bp(sys_to_check, dia_to_check)
            if bp_err:
                return jsonify({"success": False, "message": bp_err}), 400
            new_sys_bp = sys_bp
            new_dia_bp = dia_bp
        else:
            new_sys_bp = latest_record["systolic_bp"]
            new_dia_bp = latest_record["diastolic_bp"]

        bmi_info = calculate_bmi(new_height, new_weight)
        new_bmi = bmi_info["bmi"]

        update_data = {
            "age": new_age,
            "gender": new_gender,
            "height": new_height,
            "weight": new_weight,
            "bmi": new_bmi,
            "systolic_bp": new_sys_bp,
            "diastolic_bp": new_dia_bp,
            "smoking_status": new_smoking,
            "physical_activity": new_activity,
            "health_conditions": new_conditions,
            "goal": new_goal
        }

        result = health_records_collection.update_one(
            {"_id": ObjectId(record_id), "user_id": user_id},
            {"$set": update_data}
        )

        if result.matched_count == 0:
            return jsonify({"success": False, "message": "Health record not found."}), 404

        return jsonify({
            "success": True,
            "message": "Health record updated successfully.",
            "data": {
                "id": record_id,
                "user_id": user_id,
                "age": new_age,
                "gender": new_gender,
                "height": new_height,
                "weight": new_weight,
                "bmi": new_bmi,
                "bmi_category": bmi_info["category"],
                "systolic_bp": new_sys_bp,
                "diastolic_bp": new_dia_bp,
                "smoking_status": new_smoking,
                "physical_activity": new_activity,
                "health_conditions": new_conditions,
                "goal": new_goal
            }
        }), 200
    except Exception as e:
        print(f"Error updating health record: {e}")
        return jsonify({"success": False, "message": "Error updating health record."}), 500

