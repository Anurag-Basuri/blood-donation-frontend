import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Development error response
const sendDevError = (err, res) => {
    res.status(err.statusCode).json({
        success: false,
        error: err,
        message: err.message,
        stack: err.stack,
    });
};

// Production error response
const sendProdError = (err, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
    }
    // Programming or other unknown error: don't leak error details
    else {
        console.error("ERROR 💥", err);
        res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};

// Handle Mongoose validation errors
const handleValidationError = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid input data. ${errors.join(". ")}`;
    return new ApiError(400, message);
};

// Handle Mongoose duplicate field errors
const handleDuplicateFieldsDB = (err) => {
    const value = err.message.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new ApiError(400, message);
};

// Handle JWT errors
const handleJWTError = () =>
    new ApiError(401, "Invalid token. Please log in again");

const handleJWTExpiredError = () =>
    new ApiError(401, "Your token has expired. Please log in again");

// Main error handling middleware
export const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    if (process.env.NODE_ENV === "development") {
        sendDevError(err, res);
    } else if (process.env.NODE_ENV === "production") {
        let error = { ...err };
        error.message = err.message;

        if (error instanceof mongoose.Error.ValidationError) {
            error = handleValidationError(error);
        }
        if (error.code === 11000) {
            error = handleDuplicateFieldsDB(error);
        }
        if (error.name === "JsonWebTokenError") {
            error = handleJWTError();
        }
        if (error.name === "TokenExpiredError") {
            error = handleJWTExpiredError();
        }

        sendProdError(error, res);
    }
};

// 404 Not Found middleware
export const notFound = asyncHandler(async (req, res, next) => {
    throw new ApiError(404, `Route ${req.originalUrl} not found`);
});
