import { Router } from "express";
import { validateRequest } from "../../middleware/validator.middleware.js";
import { verifyJWT } from "../../middleware/auth.middleware.js";
import {
    uploadFields,
    handleMulterError,
} from "../../middleware/multer.middleware.js";
import { rateLimiter } from "../../middleware/rateLimit.middleware.js";
import {
    createOrganRequest,
    updateRequestStatus,
    findPotentialDonors,
    trackRequest,
    getHighPriorityRequests,
    cancelRequest,
} from "../../controllers/donation/organRequest.controller.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const router = Router();

// Configure file upload for medical documents
const documentUpload = uploadFields([
    { name: "medicalReports", maxCount: 3 },
    { name: "consentForms", maxCount: 2 },
    { name: "legalDocuments", maxCount: 2 },
]);

// Protect all routes
router.use(verifyJWT);

// Routes with validation and rate limiting
router.post(
    "/",
    rateLimiter({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 3, // 3 requests per 15 minutes
    }),
    documentUpload,
    handleMulterError,
    validateRequest("organRequest.create"),
    asyncHandler(createOrganRequest)
);

router.patch(
    "/:requestId/status",
    validateRequest("organRequest.updateStatus"),
    asyncHandler(updateRequestStatus)
);

router.get(
    "/:requestId/donors",
    validateRequest("organRequest.findDonors"),
    asyncHandler(findPotentialDonors)
);

router.get(
    "/high-priority",
    rateLimiter({
        windowMs: 5 * 60 * 1000, // 5 minutes
        max: 10, // 10 requests per 5 minutes
    }),
    asyncHandler(getHighPriorityRequests)
);

router.get(
    "/:requestId/track",
    validateRequest("organRequest.track"),
    asyncHandler(trackRequest)
);

router.delete(
    "/:requestId",
    validateRequest("organRequest.cancel"),
    asyncHandler(cancelRequest)
);

// Error handler
router.use((err, req, res, next) => {
    console.error("Organ Request Error:", err);
    if (err.name === "ValidationError") {
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }
    next(err);
});

export default router;
