import { Router } from "express";
import { validateRequest } from "../../middleware/validator.middleware.js";
import { verifyJWT } from "../../middleware/auth.middleware.js";
import { rateLimiter } from "../../middleware/rateLimit.middleware.js";
import {
    uploadFields,
    handleMulterError,
} from "../../middleware/multer.middleware.js";
import {
    listEquipment,
    addEquipment,
    updateEquipmentStatus,
    bookEquipment,
    getEquipmentHistory,
    EQUIPMENT_STATUS,
} from "../../controllers/sharing/equipment.controller.js";

const router = Router();

// Configure file upload for equipment images and documents
const equipmentUpload = uploadFields([
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
    handleMulterError,
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
