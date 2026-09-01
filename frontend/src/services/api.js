// HealthWise-AI Frontend API Service
// Connects React frontend components to Flask REST API backend running on http://127.0.0.1:5000/api

const rawEnvUrl = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/+$/, "");
export const API_BASE_URL = rawEnvUrl.endsWith("/api") ? rawEnvUrl : `${rawEnvUrl}/api`;

/**
 * Utility helper for standard fetch requests with JSON parsing and error handling.
 */
export async function request(endpoint, options = {}) {
    let cleanEndpoint = endpoint || "";
    if (cleanEndpoint.startsWith("/api/")) {
        cleanEndpoint = cleanEndpoint.substring(4);
    } else if (cleanEndpoint === "/api") {
        cleanEndpoint = "";
    }
    if (!cleanEndpoint.startsWith("/")) {
        cleanEndpoint = `/${cleanEndpoint}`;
    }

    const url = `${API_BASE_URL}${cleanEndpoint}`;

    const config = {
        headers: {
            "Content-Type": "application/json",
            ...options.headers
        },
        ...options
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            return {
                success: false,
                status: response.status,
                message: data.message || `Request failed with status ${response.status}`,
                data: data.data || null
            };
        }

        return {
            success: true,
            status: response.status,
            ...data
        };
    } catch (error) {
        console.error(`API Connection Error [${endpoint}]:`, error);
        return {
            success: false,
            message: "Unable to connect to HealthWise-AI backend server.",
            error: error.message
        };
    }
}

// 1. System Health Check
export async function checkSystemHealth() {
    return request("/system/health", { method: "GET" });
}

// 2. Auth APIs
export async function registerUser(userData) {
    return request("/auth/register", {
        method: "POST",
        body: JSON.stringify({
            name: userData.name,
            email: userData.email,
            password: userData.password
        })
    });
}

export async function loginUser(credentials) {
    return request("/auth/login", {
        method: "POST",
        body: JSON.stringify({
            email: credentials.email,
            password: credentials.password
        })
    });
}

// 3. BMI Calculation API
export async function calculateBMI(height, weight) {
    return request("/bmi", {
        method: "POST",
        body: JSON.stringify({ height, weight })
    });
}

// 4. Health Record APIs
export async function saveHealthRecord(recordData) {
    return request("/health", {
        method: "POST",
        body: JSON.stringify(recordData)
    });
}

export async function getUserHealthRecords(userId) {
    return request(`/health/${userId}`, { method: "GET" });
}

export async function updateUserHealthRecord(userId, recordData) {
    return request(`/health/${userId}`, {
        method: "PUT",
        body: JSON.stringify(recordData)
    });
}

// 5. ML Prediction API
export async function predictHealthRisk(predictionInput) {
    return request("/predict", {
        method: "POST",
        body: JSON.stringify(predictionInput)
    });
}

// 6. Recommendation API
export async function getRecommendations(userId) {
    return request(`/recommendations/${userId}`, { method: "GET" });
}
