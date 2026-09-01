import json
from flask import Blueprint, request, jsonify
from services.ml_service import predict_health_risk
from db import get_collection
from datetime import datetime

prediction_bp = Blueprint("prediction", __name__, url_prefix="/api")

@prediction_bp.route("/predict", methods=["POST"])
def predict():
    data = request.get_json(silent=True) or {}
    user_id = data.get("user_id")

    # Perform ML risk estimation
    result = predict_health_risk(data)

    # Save to database if user_id is provided
    if user_id and result.get("success"):
        try:
            predictions_collection = get_collection("predictions")
            if predictions_collection is not None:
                prediction_doc = {
                    "user_id": user_id,
                    "prediction_result": result.get("prediction", "Unknown"),
                    "risk_score": result.get("risk_score", 0.0),
                    "details": result.get("model_probabilities", {}),
                    "created_at": datetime.utcnow()
                }
                predictions_collection.insert_one(prediction_doc)
        except Exception as err:
            print(f"Error saving prediction to DB: {err}")

    return jsonify(result), 200
