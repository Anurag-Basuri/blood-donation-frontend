import { Router } from "express";
import { validateRequest } from "../../middleware/validator.middleware.js";
import { verifyJWT } from "../../middleware/auth.middleware.js";
import { rateLimiter } from "../../middleware/rateLimit.middleware.js";
import {
    listMedicines,
    addMedicine,
    updateMedicineStatus,
    getMedicineAnalytics,
    MEDICINE_STATUS
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
