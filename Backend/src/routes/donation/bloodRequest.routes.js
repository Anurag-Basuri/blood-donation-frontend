import { Router } from 'express';
import { validateRequest } from "../../middleware/validator.middleware.js";
import { verifyJWT } from "../../middleware/auth.middleware.js";
import { rateLimiter } from "../../middleware/rateLimit.middleware.js";
import {
    createBloodRequest,
    updateRequestStatus,
    findDonors,
    getEmergencyRequests,
    trackRequest,
    cancelRequest,
} from "../../controllers/donation/bloodRequest.controller.js";
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

// Protect all routes
router.use(verifyJWT);

// Blood Request Routes with rate limiting and validation
router.post(
    "/",
    rateLimiter({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 5, // 5 requests per 15 minutes
    }),
    validateRequest("bloodRequest.create"),
    asyncHandler(createBloodRequest)
);

router.patch(
    "/:requestId/status",
    validateRequest("bloodRequest.updateStatus"),
    asyncHandler(updateRequestStatus)
);

router.get(
    "/:requestId/donors",
    validateRequest("bloodRequest.findDonors"),
    asyncHandler(findDonors)
);

router.get(
    "/emergency",
    rateLimiter({
        windowMs: 5 * 60 * 1000, // 5 minutes
        max: 10, // 10 requests per 5 minutes
    }),
    asyncHandler(getEmergencyRequests)
);

router.get(
    "/:requestId/track",
    validateRequest("bloodRequest.track"),
    asyncHandler(trackRequest)
);

router.delete(
    "/:requestId",
    validateRequest("bloodRequest.cancel"),
    asyncHandler(cancelRequest)
);

// Error handler
router.use((err, req, res, next) => {
    console.error("Blood Request Error:", err);
    if (err.name === "ValidationError") {
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }
    next(err);
});

export default router;