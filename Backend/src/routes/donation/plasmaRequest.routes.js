import { Router } from "express";
import { validateRequest } from "../../middleware/validator.middleware.js";
import { verifyJWT } from "../../middleware/auth.middleware.js";
import { rateLimiter } from "../../middleware/rateLimit.middleware.js";
import {
    createPlasmaRequest,
    updateRequestStatus,
    findEligibleDonors,
    trackRequest,
    getEmergencyRequests,
    cancelRequest,
} from "../../controllers/donation/plasmaRequest.controller.js";

const router = Router();

// Protect all routes
router.use(verifyJWT);

// Plasma Request Routes with validation and rate limiting
router.post(
    "/",
    validateRequest("plasmaRequest.create"),
    createPlasmaRequest
);

router.patch(
    "/:requestId/status",
    validateRequest("plasmaRequest.updateStatus"),
    updateRequestStatus
);

router.get(
    "/:requestId/donors",
    validateRequest("plasmaRequest.findDonors"),
    findEligibleDonors
);

router.get(
    "/emergency",
    getEmergencyRequests
);

router.get(
    "/:requestId/track",
    validateRequest("plasmaRequest.track"),
    trackRequest
);

router.delete(
    "/:requestId",
    validateRequest("plasmaRequest.cancel"),
    cancelRequest
);

// Error handler
router.use((err, req, res, next) => {
    console.error("Plasma Request Error:", err);
    if (err.name === "ValidationError") {
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }
    next(err);
});

export default router;
