import { request } from "./api";

/**
 * Service to generate personalized health and nutrition recommendations using Gemini API via Flask backend.
 */
export const geminiService = {
  /**
   * Generates recommendations based on user health parameters by proxying to the Flask backend.
   * @param {object} userData The current logged-in user health assessment variables.
   * @returns {Promise<object>} Parsed JSON recommendations from Gemini.
   */
  generateRecommendations: async (userData) => {
    try {
      const response = await request("/api/ai/recommendations", {
        method: "POST",
        body: JSON.stringify(userData)
      });
      return response;
    } catch (e) {
      console.error("Failed to fetch or parse Gemini response:", e.message);
      throw e;
    }
  }
};

export default geminiService;
