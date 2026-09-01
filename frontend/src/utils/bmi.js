/**
 * Calculates BMI given height in cm and weight in kg.
 * @param {number|string} height Height in centimeters
 * @param {number|string} weight Weight in kilograms
 * @returns {number} Calculated BMI rounded to 1 decimal place, or 0 if inputs are invalid.
 */
export function calculateBMI(height, weight) {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!h || !w || h <= 0 || w <= 0) return 0;
    const heightInMeters = h / 100;
    return parseFloat((w / (heightInMeters * heightInMeters)).toFixed(1));
}

/**
 * Returns the text category for a given BMI.
 * @param {number} bmi 
 * @returns {string} Category label
 */
export function getBMICategory(bmi) {
    const val = parseFloat(bmi);
    if (!val || val <= 0) return "Unknown";
    if (val < 18.5) return "Underweight";
    if (val < 25) return "Normal";
    if (val < 30) return "Overweight";
    return "Obese";
}

/**
 * Returns the educational risk level assessment for a given BMI.
 * @param {number} bmi 
 * @returns {string} 'Low', 'Moderate', or 'High'
 */
export function getBMIRiskLevel(bmi) {
    const val = parseFloat(bmi);
    if (!val || val <= 0) return "Low";
    if (val < 18.5) return "Moderate";
    if (val < 25) return "Low";
    if (val < 30) return "Moderate";
    return "High";
}
