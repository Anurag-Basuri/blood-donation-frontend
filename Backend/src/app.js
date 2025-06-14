import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import mongoSanitize from "express-mongo-sanitize";
import { rateLimiter } from "./middleware/rateLimit.middleware.js";

// Import routes
import userRoutes from "./routes/users/user.routes.js";
import adminRoutes from "./routes/users/admin.routes.js";
import hospitalRoutes from "./routes/users/hospital.routes.js";
import ngoRoutes from "./routes/users/ngo.routes.js";

import appointmentRoutes from "./routes/donation/appointment.routes.js";
import bloodRequestRoutes from "./routes/donation/bloodRequest.routes.js";
import organRequestRoutes from "./routes/donation/organRequest.routes.js";
import plasmaRequestRoutes from "./routes/donation/plasmaRequest.routes.js";

import equipmentRoutes from "./routes/sharing/equipment.routes.js";
import medicineRoutes from "./routes/sharing/medicine.routes.js";

import aiRoutes from "./routes/others/ai.routes.js";
import mapRoutes from "./routes/others/map.routes.js";
import notificationRoutes from "./routes/others/notification.routes.js";

const app = express();

// Set security-related HTTP headers
app.set('trust proxy', 1);

// Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(express.json({ limit: "10kb" })); // Body parser with size limit
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());
app.use(mongoSanitize()); // Prevent NoSQL injection

// CORS configuration
app.use(
    cors({
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// Global rate limiter (use your custom middleware)
// app.use(rateLimiter);

// Health check route
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "healthy",
        timestamp: new Date(),
        uptime: process.uptime(),
    });
});

// API Routes
const apiVersion = "/api/v1";

// User management routes
app.use(`${apiVersion}/users`, userRoutes);
app.use(`${apiVersion}/admin`, adminRoutes);
app.use(`${apiVersion}/hospitals`, hospitalRoutes);
app.use(`${apiVersion}/ngos`, ngoRoutes);

// Donation management routes
app.use(`${apiVersion}/appointments`, appointmentRoutes);
app.use(`${apiVersion}/blood-requests`, bloodRequestRoutes);
app.use(`${apiVersion}/organ-requests`, organRequestRoutes);
app.use(`${apiVersion}/plasma-requests`, plasmaRequestRoutes);

// Resource sharing routes
app.use(`${apiVersion}/equipment`, equipmentRoutes);
app.use(`${apiVersion}/medicines`, medicineRoutes);
// If you have a resourceRoutes import, uncomment the next line
// import resourceRoutes from "./routes/sharing/resource.routes.js";
// app.use(`${apiVersion}/resources`, resourceRoutes);

// Other utility routes
app.use(`${apiVersion}/ai`, aiRoutes);
app.use(`${apiVersion}/maps`, mapRoutes);
app.use(`${apiVersion}/notifications`, notificationRoutes);

// 404 Handler
app.use("*", (req, res) => {
    res.status(404).json({
        success: false,
        message: `Cannot ${req.method} ${req.originalUrl}`,
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error("Global Error:", err);

    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
});

export default app;
