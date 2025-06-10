import { Router } from "express";
import { validateRequest } from "../../middleware/validator.middleware.js";
import { verifyJWT } from "../../middleware/auth.middleware.js";
import { rateLimiter } from "../../middleware/rateLimit.middleware.js";
import { upload } from "../../middleware/multer.middleware.js";
import {
    listEquipment,
    addEquipment,
    updateEquipmentStatus,
    bookEquipment,
    getEquipmentHistory,
    EQUIPMENT_STATUS,
} from "../../controllers/sharing/equipment.controller.js";

const router = Router();

// Configure file upload for equipment images
const equipmentUpload = upload.fields([
    { name: "images", maxCount: 5 },
    { name: "documents", maxCount: 3 },
]);

// Public routes
router.get(
    "/",
    rateLimiter({
        windowMs: 1 * 60 * 1000,
        max: 30,
    }),
    validateRequest("equipment.list"),
    listEquipment
);

// Protected routes
router.use(verifyJWT);

router.post(
    "/",
    equipmentUpload,
    validateRequest("equipment.add"),
    addEquipment
);

router.patch(
    "/:equipmentId/status",
    validateRequest("equipment.updateStatus"),
    updateEquipmentStatus
);

router.post(
    "/:equipmentId/book",
    validateRequest("equipment.book"),
    bookEquipment
);

router.get(
    "/:equipmentId/history",
    validateRequest("equipment.history"),
    getEquipmentHistory
);

// Validation Schemas
import Joi from "joi";

const EQUIPMENT_TYPES = [
    "BLOOD_STORAGE",
    "TRANSPORTATION",
    "TESTING",
    "COLLECTION",
    "PROCESSING",
    "MONITORING",
];

export const equipmentValidationRules = {
    list: Joi.object({
        type: Joi.string().valid(...EQUIPMENT_TYPES),
        location: Joi.object({
            latitude: Joi.number().min(-90).max(90),
            longitude: Joi.number().min(-180).max(180),
        }),
        radius: Joi.number().min(1).max(100).default(10),
        condition: Joi.string().valid(
            "EXCELLENT",
            "GOOD",
            "FAIR",
            "NEEDS_MAINTENANCE"
        ),
        sortBy: Joi.string()
            .valid("distance", "condition", "recentlyAdded")
            .default("distance"),
        page: Joi.number().min(1).default(1),
        limit: Joi.number().min(1).max(50).default(10),
        availability: Joi.boolean().default(true),
    }),

    add: Joi.object({
        name: Joi.string().required().min(3).max(100),
        type: Joi.string()
            .valid(...EQUIPMENT_TYPES)
            .required(),
        details: Joi.object({
            manufacturer: Joi.string(),
            model: Joi.string(),
            serialNumber: Joi.string(),
            purchaseDate: Joi.date(),
            condition: Joi.string()
                .valid("EXCELLENT", "GOOD", "FAIR", "NEEDS_MAINTENANCE")
                .required(),
            specifications: Joi.object(),
            capacity: Joi.number(),
        }).required(),
        location: Joi.object({
            type: Joi.string().valid("Point"),
            coordinates: Joi.array().items(Joi.number()).length(2),
            address: Joi.string(),
        }),
        maintenance: Joi.object({
            lastMaintenance: Joi.date(),
            nextMaintenanceDue: Joi.date(),
            maintenanceProvider: Joi.string(),
        }),
    }),

    updateStatus: Joi.object({
        status: Joi.string()
            .valid(...Object.values(EQUIPMENT_STATUS))
            .required(),
        notes: Joi.string().max(500),
        maintenanceDetails: Joi.when("status", {
            is: "MAINTENANCE",
            then: Joi.object({
                provider: Joi.string().required(),
                description: Joi.string().required(),
                expectedCompletion: Joi.date(),
            }).required(),
        }),
    }),

    book: Joi.object({
        startDate: Joi.date().greater("now").required(),
        endDate: Joi.date().greater(Joi.ref("startDate")).required(),
        purpose: Joi.string().min(10).max(500).required(),
    }),

    history: Joi.object({
        equipmentId: Joi.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .required(),
    }),
};

// Error handler
router.use((err, req, res, next) => {
    console.error("Equipment Error:", err);
    if (err.name === "ValidationError") {
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }
    next(err);
});

export default router;
