import { Router } from "express";
import { validateRequest } from "../../middleware/validator.middleware.js";
import { verifyJWT } from "../../middleware/auth.middleware.js";
import { upload } from "../../middleware/multer.middleware.js";
import { rateLimiter } from "../../middleware/rateLimit.middleware.js";
import {
    listResources,
    addResource,
    updateResourceStatus,
    requestResource,
    getResourceHistory,
    getResourceAnalytics,
} from "../../controllers/sharing/resource.controller.js";

const router = Router();

// Configure file upload for resource images and documents
const resourceUpload = upload.fields([
    { name: "images", maxCount: 5 },
    { name: "documents", maxCount: 3 },
]);

// Public routes with rate limiting
router.get(
    "/",
    rateLimiter({
        windowMs: 1 * 60 * 1000, // 1 minute
        max: 30,
    }),
    validateRequest("resource.list"),
    listResources
);

// Protected routes
router.use(verifyJWT);

router.post("/", resourceUpload, validateRequest("resource.add"), addResource);

router.patch(
    "/:resourceId/status",
    validateRequest("resource.updateStatus"),
    updateResourceStatus
);

router.post(
    "/:resourceId/request",
    validateRequest("resource.request"),
    requestResource
);

router.get(
    "/:resourceId/history",
    validateRequest("resource.history"),
    getResourceHistory
);

router.get(
    "/analytics",
    validateRequest("resource.analytics"),
    getResourceAnalytics
);

// Validation Schemas
import Joi from "joi";

const RESOURCE_TYPES = [
    "MEDICAL_SUPPLIES",
    "PPE",
    "TESTING_KITS",
    "INSTRUMENTS",
    "STORAGE_EQUIPMENT",
    "TRANSPORT_EQUIPMENT",
];

const RESOURCE_STATUS = [
    "AVAILABLE",
    "LOW_STOCK",
    "OUT_OF_STOCK",
    "RESERVED",
    "MAINTENANCE",
];

export const resourceValidationRules = {
    list: Joi.object({
        type: Joi.string().valid(...RESOURCE_TYPES),
        location: Joi.object({
            latitude: Joi.number().min(-90).max(90),
            longitude: Joi.number().min(-180).max(180),
        }),
        radius: Joi.number().min(1).max(100).default(10),
        status: Joi.string().valid(...RESOURCE_STATUS),
        sortBy: Joi.string()
            .valid("distance", "availability", "recentlyAdded")
            .default("distance"),
        page: Joi.number().min(1).default(1),
        limit: Joi.number().min(1).max(50).default(10),
    }),

    add: Joi.object({
        name: Joi.string().required().min(3).max(100),
        type: Joi.string()
            .valid(...RESOURCE_TYPES)
            .required(),
        details: Joi.object({
            manufacturer: Joi.string(),
            model: Joi.string(),
            specifications: Joi.object(),
            quantity: Joi.number().min(1).required(),
            condition: Joi.string().required(),
        }).required(),
        location: Joi.object({
            type: Joi.string().valid("Point"),
            coordinates: Joi.array().items(Joi.number()).length(2),
        }).required(),
        availability: Joi.object({
            startDate: Joi.date(),
            endDate: Joi.date(),
            sharingTerms: Joi.string(),
        }),
        maintenance: Joi.object({
            lastCheck: Joi.date(),
            nextCheckDue: Joi.date(),
            status: Joi.string(),
        }),
    }),

    updateStatus: Joi.object({
        status: Joi.string()
            .valid(...RESOURCE_STATUS)
            .required(),
        quantity: Joi.number().min(0),
        notes: Joi.string().max(500),
    }),

    request: Joi.object({
        startDate: Joi.date().greater("now").required(),
        endDate: Joi.date().greater(Joi.ref("startDate")).required(),
        quantity: Joi.number().min(1).required(),
        purpose: Joi.string().min(20).max(500).required(),
    }),

    history: Joi.object({
        startDate: Joi.date(),
        endDate: Joi.date().greater(Joi.ref("startDate")),
        type: Joi.string().valid("USAGE", "MAINTENANCE", "SHARING"),
    }),

    analytics: Joi.object({
        period: Joi.string()
            .valid("daily", "weekly", "monthly", "yearly")
            .default("monthly"),
        type: Joi.string().valid(...RESOURCE_TYPES),
    }),
};

// Error handler
router.use((err, req, res, next) => {
    console.error("Resource Error:", err);
    if (err.name === "ValidationError") {
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }
    next(err);
});

export default router;
