/**
 * Custom API Error class for handling application errors
 * @extends Error
 */
class ApiError extends Error {
    /**
     * Create an ApiError instance
     * @param {number} statusCode - HTTP status code
     * @param {string} message - Error message
     * @param {Array} errors - List of validation errors
     * @param {string} stack - Error stack trace
     */
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ) {
        super(message);

        // Validate status code
        if (
            !Number.isInteger(statusCode) ||
            statusCode < 100 ||
            statusCode > 599
        ) {
            throw new Error("Invalid HTTP status code");
        }

        this.statusCode = statusCode;
        this.data = null;
        this.message = message;
        this.success = false;
        this.errors = Array.isArray(errors) ? errors : [errors];
        this.timestamp = new Date().toISOString();

        // Handle stack trace
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    /**
     * Create a 400 Bad Request error
     * @param {string} message - Error message
     * @param {Array} errors - Validation errors
     */
    static badRequest(message, errors = []) {
        return new ApiError(400, message, errors);
    }

    /**
     * Create a 401 Unauthorized error
     * @param {string} message - Error message
     */
    static unauthorized(message = "Unauthorized access") {
        return new ApiError(401, message);
    }

    /**
     * Create a 403 Forbidden error
     * @param {string} message - Error message
     */
    static forbidden(message = "Forbidden access") {
        return new ApiError(403, message);
    }

    /**
     * Create a 404 Not Found error
     * @param {string} message - Error message
     */
    static notFound(message = "Resource not found") {
        return new ApiError(404, message);
    }

    /**
     * Create a 429 Too Many Requests error
     * @param {string} message - Error message
     */
    static tooManyRequests(message = "Too many requests") {
        return new ApiError(429, message);
    }

    /**
     * Create a 500 Internal Server Error
     * @param {string} message - Error message
     */
    static internal(message = "Internal server error") {
        return new ApiError(500, message);
    }

    /**
     * Convert error to JSON format
     * @returns {Object} JSON representation of the error
     */
    toJSON() {
        return {
            success: this.success,
            statusCode: this.statusCode,
            message: this.message,
            errors: this.errors,
            timestamp: this.timestamp,
            ...(process.env.NODE_ENV === "development" && {
                stack: this.stack,
            }),
        };
    }
}

export { ApiError };
