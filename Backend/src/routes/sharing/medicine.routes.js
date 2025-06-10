import { Router } from "express";
import { validateRequest } from "../../middleware/validator.middleware.js";
import { verifyJWT } from "../../middleware/auth.middleware.js";
import { rateLimiter } from "../../middleware/rateLimit.middleware.js";
import {
    listMedicines,
    addMedicine,
    updateMedicineStatus,
    getMedicineAnalytics,
    MEDICINE_STATUS,
} from "../../controllers/sharing/medicine.controller.js";

const router = Router();

// Public routes with rate limiting
router.get(
    "/",
    rateLimiter({
        windowMs: 1 * 60 * 1000, // 1 minute
        max: 30, // 30 requests per minute
    }),
    validateRequest("medicine.list"),
    listMedicines
);

// Protected routes
router.use(verifyJWT);

router.post(
    "/",
    rateLimiter({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 10, // 10 new medicines per 15 minutes
    }),
    validateRequest("medicine.add"),
    addMedicine
);

router.patch(
    "/:medicineId/status",
    validateRequest("medicine.updateStatus"),
    updateMedicineStatus
);

router.get(
    "/analytics",
    validateRequest("medicine.analytics"),
    getMedicineAnalytics
);

// Validation Schemas
import Joi from "joi";

const MEDICINE_CATEGORIES = [
    "ESSENTIAL",
    "ANTIBIOTICS",
    "PAINKILLERS",
    "SUPPLEMENTS",
    "EMERGENCY",
    "OTHER",
];

export const medicineValidationRules = {
    list: Joi.object({
        category: Joi.string().valid(...MEDICINE_CATEGORIES),
        location: Joi.object({
            latitude: Joi.number().min(-90).max(90),
            longitude: Joi.number().min(-180).max(180),
        }),
        radius: Joi.number().min(1).max(100).default(10),
        expiryAfter: Joi.date().min("now"),
        prescriptionRequired: Joi.boolean(),
        sortBy: Joi.string()
            .valid("expiry", "quantity", "recentlyAdded")
            .default("expiry"),
        page: Joi.number().min(1).default(1),
        limit: Joi.number().min(1).max(50).default(10),
    }),

    add: Joi.object({
        name: Joi.string().required().min(3).max(100),
        category: Joi.string()
            .valid(...MEDICINE_CATEGORIES)
            .required(),
        details: Joi.object({
            manufacturer: Joi.string(),
            genericName: Joi.string(),
            composition: Joi.string(),
            prescriptionRequired: Joi.boolean().default(false),
            storage: Joi.string(),
            dosageForm: Joi.string(),
        }).required(),
        expiryDate: Joi.date().greater("now").required(),
        quantity: Joi.number().min(1).required(),
        location: Joi.object({
            type: Joi.string().valid("Point"),
            coordinates: Joi.array().items(Joi.number()).length(2),
        }).required(),
        storage: Joi.object({
            temperature: Joi.string(),
            conditions: Joi.string(),
            specialRequirements: Joi.array().items(Joi.string()),
        }),
    }),

    updateStatus: Joi.object({
        status: Joi.string().valid(...Object.values(MEDICINE_STATUS)),
        quantity: Joi.number().min(0),
        notes: Joi.string().max(500),
    }).or("status", "quantity"),

    analytics: Joi.object({
        startDate: Joi.date().required(),
        endDate: Joi.date().greater(Joi.ref("startDate")).required(),
    }),
};

// Error handler
router.use((err, req, res, next) => {
    console.error("Medicine Error:", err);
    if (err.name === "ValidationError") {
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }
    next(err);
});

export default router;
