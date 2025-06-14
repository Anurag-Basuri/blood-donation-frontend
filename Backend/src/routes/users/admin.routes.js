import express from "express";
import {
    registerAdmin,
    loginAdmin,
    verifyHospital,
    verifyNGO,
    getSystemAnalytics,
} from "../../controllers/users/admin.controller.js";
import { verifyJWT } from "../../middleware/auth.middleware.js";
import { validateRequest } from "../../middleware/validator.middleware.js";
import { adminValidationRules } from "../../validations/admin.validations.js";
import { rateLimiter } from "../../middleware/rateLimit.middleware.js";

const router = express.Router();

// Auth routes with rate limiting
router.post(
    "/register",
    validateRequest(adminValidationRules.register),
    registerAdmin
);

router.post(
    "/login",
    validateRequest(adminValidationRules.login),
    loginAdmin
);

// Verification routes
router.patch(
    "/verify/hospital/:hospitalId",
    verifyJWT,
    validateRequest(adminValidationRules.verification),
    verifyHospital
);

router.patch(
    "/verify/ngo/:ngoId",
    verifyJWT,
    validateRequest(adminValidationRules.verification),
    verifyNGO
);

// Analytics routes
router.get("/analytics", verifyJWT, getSystemAnalytics);

// router.get("/activities", verifyJWT, getSystemActivities);

// Optional: Advanced query routes
router.get(
    "/analytics/custom",
    verifyJWT,
    validateRequest(adminValidationRules.customAnalytics),
    getSystemAnalytics
);

// Health check route
router.get("/health", verifyJWT, (req, res) => {
    res.status(200).json({
        status: "healthy",
        timestamp: new Date(),
        version: process.env.API_VERSION || "1.0.0",
    });
});

export default router;
