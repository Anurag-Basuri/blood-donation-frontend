import { Router } from "express";
import { validateRequest } from "../../middleware/validator.middleware.js";
import { verifyJWT } from "../../middleware/auth.middleware.js";
import { rateLimiter } from "../../middleware/rateLimit.middleware.js";
import {
    createAppointment,
    updateAppointment,
    sendReminder,
    APPOINTMENT_STATUS,
} from "../../controllers/donation/appointment.controller.js";

const router = Router();

// Error handler
router.use((err, req, res, next) => {
    if (err.name === "ValidationError") {
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }
    next(err);
});

// Protect all appointment routes
router.use(verifyJWT);

// Create appointment with rate limiting
router.post(
    "/",
    rateLimiter({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 3, // 3 appointments per 15 minutes
    }),
    validateRequest("appointment.create"),
    createAppointment
);

// Update appointment
router.patch(
    "/:appointmentId",
    validateRequest("appointment.update"),
    updateAppointment
);

// Send reminder
router.post(
    "/:appointmentId/remind",
    rateLimiter({
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 2, // 2 reminders per hour per appointment
    }),
    validateRequest("appointment.reminder"),
    sendReminder
);
