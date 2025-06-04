class ApiResponse {
    constructor(statusCode, data, message = "Success") {
        // Validate statusCode
        if (
            !Number.isInteger(statusCode) ||
            statusCode < 100 ||
            statusCode > 599
        ) {
            throw new Error(
                "Status code must be a valid HTTP status code (100-599)"
            );
        }

        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.success = statusCode < 400; // Fixed: lowercase 'success'
        this.timestamp = new Date().toISOString(); // Added timestamp
    }

    // Check if response indicates success
    isSuccess() {
        return this.success;
    }

    // Check if response indicates client error (4xx)
    isClientError() {
        return this.statusCode >= 400 && this.statusCode < 500;
    }

    // Check if response indicates server error (5xx)
    isServerError() {
        return this.statusCode >= 500;
    }

    // Convert to JSON string
    toJSON() {
        return {
            statusCode: this.statusCode,
            message: this.message,
            data: this.data,
            success: this.success,
            timestamp: this.timestamp,
        };
    }

    // Create success response helper
    static success(data, message = "Success", statusCode = 200) {
        return new ApiResponse(statusCode, data, message);
    }

    // Create error response helper
    static error(message, statusCode = 500, data = null) {
        return new ApiResponse(statusCode, data, message);
    }

    // Create not found response helper
    static notFound(message = "Resource not found", data = null) {
        return new ApiResponse(404, data, message);
    }

    // Create bad request response helper
    static badRequest(message = "Bad request", data = null) {
        return new ApiResponse(400, data, message);
    }

    // Create unauthorized response helper
    static unauthorized(message = "Unauthorized", data = null) {
        return new ApiResponse(401, data, message);
    }

    // Create forbidden response helper
    static forbidden(message = "Forbidden", data = null) {
        return new ApiResponse(403, data, message);
    }
}

export { ApiResponse };