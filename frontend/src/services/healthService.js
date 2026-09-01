import { request } from "./api";

/**
 * Maps frontend assessment wizard state to the expected backend schemas.
 * @param {string|number} userId 
 * @param {object} frontendData 
 * @returns {object} Backend request schema
 */
export function mapFrontendToBackendHealth(userId, frontendData) {
    // 1. Map smoking status
    let smoking_status = "non-smoker";
    const sm = frontendData.smoking;
    if (sm === "Current") {
        smoking_status = "smoker";
    } else if (sm === "Former") {
        smoking_status = "former";
    }

    // 2. Map physical activity
    let physical_activity = "moderate";
    const act = frontendData.activity;
    if (act === "Sedentary") {
        physical_activity = "sedentary";
    } else if (act === "Light") {
        physical_activity = "low";
    } else if (act === "Moderate") {
        physical_activity = "moderate";
    } else if (act === "Active") {
        physical_activity = "active";
    }

    // 3. Map health conditions
    let health_conditions_list = [];
    if (frontendData.conditions && Array.isArray(frontendData.conditions)) {
        health_conditions_list = frontendData.conditions
            .filter(c => c && c !== "None")
            .map(c => c.toLowerCase());
    }

    if (frontendData.otherConditions && frontendData.otherConditions.trim()) {
        health_conditions_list.push(frontendData.otherConditions.trim().toLowerCase());
    }

    const health_conditions = health_conditions_list.length > 0 
        ? health_conditions_list.join(", ") 
        : "none";

    const sys_bp = frontendData.systolic_bp ? parseInt(frontendData.systolic_bp, 10) : null;
    const dia_bp = frontendData.diastolic_bp ? parseInt(frontendData.diastolic_bp, 10) : null;

    return {
        user_id: parseInt(userId, 10),
        age: parseInt(frontendData.age, 10),
        gender: (frontendData.gender || "male").toLowerCase(),
        height: parseFloat(frontendData.height),
        weight: parseFloat(frontendData.weight),
        systolic_bp: sys_bp,
        diastolic_bp: dia_bp,
        smoking_status,
        physical_activity,
        health_conditions,
        systolic: frontendData.systolic && frontendData.systolic !== "" ? parseInt(frontendData.systolic, 10) : null,
        diastolic: frontendData.diastolic && frontendData.diastolic !== "" ? parseInt(frontendData.diastolic, 10) : null,
        goal: frontendData.goal || null
    };
}

export const healthService = {
    /**
     * Calculates BMI via backend.
     * @param {number|string} height cm
     * @param {number|string} weight kg
     */
    calculateBmi: async (height, weight) => {
        return request("/api/bmi", {
            method: "POST",
            body: JSON.stringify({
                height: parseFloat(height),
                weight: parseFloat(weight)
            })
        });
    },

    /**
     * Stores a new health record on the backend.
     * @param {object} healthData Mapped health record
     */
    saveHealthRecord: async (healthData) => {
        return request("/api/health", {
            method: "POST",
            body: JSON.stringify(healthData)
        });
    },

    /**
     * Updates an existing health record on the backend.
     * @param {string|number} userId 
     * @param {object} healthData Partial or full record parameters
     */
    updateHealthRecord: async (userId, healthData) => {
        return request(`/api/health/${userId}`, {
            method: "PUT",
            body: JSON.stringify(healthData)
        });
    },

    /**
     * Retrieves health records history for a user.
     * @param {string|number} userId 
     */
    getHealthHistory: async (userId) => {
        return request(`/api/health/${userId}`, {
            method: "GET"
        });
    },

    /**
     * Obtains ML-based risk predictions.
     * @param {object} healthData Mapped health record
     */
    getMLPrediction: async (healthData) => {
        return request("/api/predict", {
            method: "POST",
            body: JSON.stringify(healthData)
        });
    },

    /**
     * Retrieves lifestyle recommendations.
     * @param {string|number} userId 
     */
    getRecommendations: async (userId) => {
        return request(`/api/recommendations/${userId}`, {
            method: "GET"
        });
    },

    /**
     * Checks if the backend server is online.
     */
    checkServerHealth: async () => {
        return request("/api/system/health", {
            method: "GET"
        });
    }
};

export default healthService;
