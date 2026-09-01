/**
 * Validates an email address format.
 * @param {string} email 
 * @returns {boolean}
 */
export function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

/**
 * Validates a name (minimum 2 characters, required).
 * @param {string} name 
 * @returns {boolean}
 */
export function isValidName(name) {
    return typeof name === 'string' && name.trim().length >= 2;
}

/**
 * Validates a password (minimum 8 characters).
 * @param {string} password 
 * @returns {boolean}
 */
export function isValidPassword(password) {
    return typeof password === 'string' && password.length >= 8;
}

/**
 * Validates age (must be a number between 1 and 120).
 * @param {number|string} age 
 * @returns {boolean}
 */
export function isValidAge(age) {
    const num = parseInt(age, 10);
    return !isNaN(num) && num >= 1 && num <= 120;
}

/**
 * Validates height in cm (must be between 50 and 250).
 * @param {number|string} height 
 * @returns {boolean}
 */
export function isValidHeight(height) {
    const num = parseFloat(height);
    return !isNaN(num) && num >= 50 && num <= 250;
}

/**
 * Validates weight in kg (must be between 10 and 300).
 * @param {number|string} weight 
 * @returns {boolean}
 */
export function isValidWeight(weight) {
    const num = parseFloat(weight);
    return !isNaN(num) && num >= 10 && num <= 300;
}
