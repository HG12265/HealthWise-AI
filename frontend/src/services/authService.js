import { request } from "./api";

export const authService = {
    /**
     * Registers a new user.
     * @param {string} name 
     * @param {string} email 
     * @param {string} password 
     */
    register: async (name, email, password) => {
        const response = await request("/auth/register", {
            method: "POST",
            body: JSON.stringify({ name, email, password }),
        });

        if (response && response.success && response.data) {
            const userObj = {
                id: response.data.id,
                name: response.data.name,
                email: response.data.email,
                isRegistered: true
            };
            localStorage.setItem("healthwise_user", JSON.stringify(userObj));
            localStorage.setItem("healthwise_user_id", String(response.data.id));
            localStorage.setItem("healthwise_user_name", response.data.name);
            localStorage.setItem("healthwise_user_email", response.data.email);
        }

        return response;
    },

    /**
     * Authenticates user credentials.
     * @param {string} email 
     * @param {string} password 
     */
    login: async (email, password) => {
        const response = await request("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });

        if (response && response.success && response.data) {
            const userObj = {
                id: response.data.id,
                name: response.data.name,
                email: response.data.email,
                isRegistered: true
            };
            localStorage.setItem("healthwise_user", JSON.stringify(userObj));
            localStorage.setItem("healthwise_auth", "true");
            localStorage.setItem("healthwise_user_id", String(response.data.id));
            localStorage.setItem("healthwise_user_name", response.data.name);
            localStorage.setItem("healthwise_user_email", response.data.email);
        }
        
        return response;
    },

    /**
     * Logs the user out by clearing session variables.
     */
    logout: () => {
        localStorage.removeItem("healthwise_auth");
        localStorage.removeItem("healthwise_user");
        localStorage.removeItem("healthwise_user_id");
        localStorage.removeItem("healthwise_user_name");
        localStorage.removeItem("healthwise_user_email");
    },

    /**
     * Verifies if a session is currently active.
     * @returns {boolean}
     */
    isAuthenticated: () => {
        return localStorage.getItem("healthwise_auth") === "true";
    },

    /**
     * Gets the authenticated user object.
     * @returns {object|null}
     */
    getCurrentUser: () => {
        const storedUserStr = localStorage.getItem("healthwise_user");
        if (storedUserStr) {
            try {
                return JSON.parse(storedUserStr);
            } catch (e) {}
        }
        const name = localStorage.getItem("healthwise_user_name") || "User";
        const email = localStorage.getItem("healthwise_user_email") || "";
        const id = localStorage.getItem("healthwise_user_id") || "1";
        return { id, name, email };
    },

    /**
     * Gets the authenticated user's ID as a valid integer/string.
     * @returns {string|number}
     */
    getCurrentUserId: () => {
        const storedId = localStorage.getItem("healthwise_user_id");
        if (storedId && storedId !== "null" && storedId !== "undefined") {
            return storedId;
        }

        const storedUserStr = localStorage.getItem("healthwise_user");
        if (storedUserStr) {
            try {
                const u = JSON.parse(storedUserStr);
                if (u.id) return String(u.id);
            } catch (e) {}
        }
        return "1";
    },

    /**
     * Gets the authenticated user's name.
     * @returns {string}
     */
    getCurrentUserName: () => {
        const user = authService.getCurrentUser();
        return user ? user.name : "User";
    }
};

export default authService;
