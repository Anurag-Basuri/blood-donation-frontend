import { Router } from "express";
import { validateRequest } from "../../middleware/validator.middleware.js";
import { verifyJWT } from "../../middleware/auth.middleware.js";
import {
    findDonorMatches,
    predictSupply,
    optimizeEmergencyResponse,
    analyzeDonorRetention,
    getCampaignInsights,
    predictDonorHealth,
} from "../../controllers/others/ai.controller.js";

const router = Router();

// Protect all AI routes
router.use(verifyJWT);

// Donor matching routes
router.post(
    "/donors/match",
    validateRequest("ai.donorMatch"),
    findDonorMatches
);

// Supply prediction routes
router.get(
    "/supply/:locationId/predict",
    validateRequest("ai.supplyPredict"),
    predictSupply
);

// Emergency optimization routes
router.post(
    "/emergency/optimize",
    validateRequest("ai.emergency"),
    optimizeEmergencyResponse
);

// Donor retention analysis
router.get(
    "/donors/:donorId/retention",
    validateRequest("ai.retention"),
    analyzeDonorRetention
);

// Campaign insights
router.get(
    "/campaigns/:campaignId/insights",
    validateRequest("ai.campaign"),
    getCampaignInsights
);

// Health predictions
router.get(
    "/donors/:donorId/health",
    validateRequest("ai.health"),
    predictDonorHealth
);

// Error handler
router.use((err, req, res, next) => {
    console.error("AI Service Error:", err);
    if (err.name === "ValidationError") {
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }
    next(err);
});

export default router;
