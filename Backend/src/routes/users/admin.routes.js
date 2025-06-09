import express from "express";
import {
    registerAdmin,
    loginAdmin,
    verifyHospital,
    verifyNGO,
    getSystemAnalytics,
    getSystemActivities,
} from "../../controllers/users/admin.controller.js";
import {
    verifyAdmin,
    verifyRefreshToken,
} from "../../middleware/auth.middleware.js";
import { validateRequest } from "../../middleware/validator.middleware.js";
import { adminValidationRules } from "../../validations/admin.validations.js";
import { rateLimiter } from "../../middleware/rateLimit.middleware.js";

const router = express.Router();

// Auth routes with rate limiting
router.post(
    "/register",
    rateLimiter({
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 5, // 5 requests per hour
    }),
    validateRequest(adminValidationRules.register),
    verifyAdmin,
    registerAdmin
);

router.post(
    "/login",
    rateLimiter({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 5, // 5 attempts per 15 minutes
    }),
    validateRequest(adminValidationRules.login),
    loginAdmin
);

// Verification routes
router.patch(
    "/verify/hospital/:hospitalId",
    verifyAdmin,
    validateRequest(adminValidationRules.verification),
    verifyHospital
);

router.patch(
    "/verify/ngo/:ngoId",
    verifyAdmin,
    validateRequest(adminValidationRules.verification),
    verifyNGO
);

// Analytics routes
router.get("/analytics", verifyAdmin, getSystemAnalytics);

router.get("/activities", verifyAdmin, getSystemActivities);

// Optional: Advanced query routes
router.get(
    "/analytics/custom",
    verifyAdmin,
    validateRequest(adminValidationRules.customAnalytics),
    getSystemAnalytics
);

// Health check route
router.get("/health", verifyAdmin, (req, res) => {
    res.status(200).json({
        status: "healthy",
        timestamp: new Date(),
        version: process.env.API_VERSION || "1.0.0",
    });
});

export default router;
