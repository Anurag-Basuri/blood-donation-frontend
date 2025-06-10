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
import Joi from "joi";

export const appointmentValidationRules = {
    create: Joi.object({
        facilityId: Joi.string()
            .required()
            .trim()
            .regex(/^[0-9a-fA-F]{24}$/)
            .message("Invalid facility ID"),
        date: Joi.date().greater("now").required().messages({
            "date.greater": "Appointment date must be in the future",
        }),
        slotTime: Joi.string().required().trim(),
        bloodGroup: Joi.string()
            .valid("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-")
            .required(),
        donationType: Joi.string()
            .valid("WHOLE_BLOOD", "PLASMA", "PLATELETS")
            .required(),
        healthDeclaration: Joi.object({
            recentIllness: Joi.boolean(),
            medications: Joi.array().items(Joi.string()),
            lastMeal: Joi.date(),
            restingHours: Joi.number(),
        }),
    }),

    update: Joi.object({
        status: Joi.string()
            .valid(...Object.values(APPOINTMENT_STATUS))
            .when("newDate", { is: Joi.exist(), then: Joi.forbidden() }),
        reason: Joi.string()
            .when("status", {
                is: APPOINTMENT_STATUS.CANCELLED,
                then: Joi.required(),
                otherwise: Joi.optional(),
            })
            .min(10)
            .max(200),
        newDate: Joi.date()
            .greater("now")
            .when("status", { is: Joi.exist(), then: Joi.forbidden() }),
        newSlotTime: Joi.string().when("newDate", {
            is: Joi.exist(),
            then: Joi.required(),
            otherwise: Joi.forbidden(),
        }),
    }).xor("status", "newDate"),

    reminder: Joi.object({
        includeTraffic: Joi.boolean().default(true),
        includeWeather: Joi.boolean().default(true),
        sendSMS: Joi.boolean().default(true),
    }),
};

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

export default router;

const router = Router();

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
