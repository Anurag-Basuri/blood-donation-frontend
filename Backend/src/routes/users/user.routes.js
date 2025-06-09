import express from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    updateProfile,
    bookDonationAppointment,
    createBloodRequest,
    getDonationHistory,
    getRequestHistory,
    getNotifications,
    markNotificationsRead,
    getCurrentUser,
    updateEmergencyContact,
    changePassword,
} from "../../controllers/users/user.controller.js";
import { verifyUser } from "../../middleware/auth.middleware.js";
import { validateRequest } from "../../middleware/validator.middleware.js";
import { rateLimiter } from "../../middleware/rateLimit.middleware.js";

const router = express.Router();

// Auth Routes
router.post(
    "/register",
    rateLimiter({
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 5, // 5 registrations per hour
    }),
    validateRequest(userValidationSchemas.register),
    registerUser
);

router.post(
    "/login",
    rateLimiter({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 5, // 5 login attempts
    }),
    validateRequest(userValidationSchemas.login),
    loginUser
);

router.post("/logout", verifyUser, logoutUser);
router.post("/refresh-token", refreshAccessToken);

// Profile Management Routes
router
    .route("/profile")
    .get(verifyUser, getCurrentUser)
    .patch(
        verifyUser,
        validateRequest(userValidationSchemas.profileUpdate),
        updateProfile
    );

router.patch(
    "/change-password",
    verifyUser,
    validateRequest(userValidationSchemas.passwordChange),
    changePassword
);

router.patch(
    "/emergency-contact",
    verifyUser,
    validateRequest(userValidationSchemas.emergencyContact),
    updateEmergencyContact
);

// Donation Management Routes
router.post(
    "/appointments",
    verifyUser,
    validateRequest(userValidationSchemas.appointment),
    bookDonationAppointment
);

router.get("/donations/history", verifyUser, getDonationHistory);

// Blood Request Routes
router.post(
    "/blood-requests",
    verifyUser,
    validateRequest(userValidationSchemas.bloodRequest),
    createBloodRequest
);

router.get("/requests/history", verifyUser, getRequestHistory);

// Notification Routes
router.get("/notifications", verifyUser, getNotifications);
router.patch("/notifications/mark-read", verifyUser, markNotificationsRead);

export default router;

// Validation Schemas
const userValidationSchemas = {
    register: Joi.object({
        fullName: Joi.string().required().min(3),
        email: Joi.string().email().required(),
        password: Joi.string()
            .min(8)
            .pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)
            .required(),
        phone: Joi.string()
            .pattern(/^\+?[\d\s-]{10,}$/)
            .required(),
        bloodType: Joi.string().valid(
            "A+",
            "A-",
            "B+",
            "B-",
            "AB+",
            "AB-",
            "O+",
            "O-"
        ),
        address: Joi.object({
            street: Joi.string(),
            city: Joi.string().required(),
            state: Joi.string().required(),
            pinCode: Joi.string()
                .pattern(/^\d{6}$/)
                .required(),
            location: Joi.object({
                type: Joi.string().valid("Point"),
                coordinates: Joi.array().items(Joi.number()).length(2),
            }),
        }),
        dateOfBirth: Joi.date().max("now"),
        medicalInfo: Joi.object({
            lastCheckup: Joi.date(),
            conditions: Joi.array().items(Joi.string()),
            medications: Joi.array().items(Joi.string()),
        }),
    }),

    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    }),

    profileUpdate: Joi.object({
        fullName: Joi.string().min(3),
        phone: Joi.string().pattern(/^\+?[\d\s-]{10,}$/),
        address: Joi.object({
            street: Joi.string(),
            city: Joi.string(),
            state: Joi.string(),
            pinCode: Joi.string().pattern(/^\d{6}$/),
            location: Joi.object({
                type: Joi.string().valid("Point"),
                coordinates: Joi.array().items(Joi.number()).length(2),
            }),
        }),
        preferences: Joi.object(),
        medicalInfo: Joi.object(),
    }).min(1),

    passwordChange: Joi.object({
        oldPassword: Joi.string().required(),
        newPassword: Joi.string()
            .min(8)
            .pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)
            .required(),
    }),

    emergencyContact: Joi.object({
        name: Joi.string().required(),
        relationship: Joi.string().required(),
        phone: Joi.string()
            .pattern(/^\+?[\d\s-]{10,}$/)
            .required(),
        address: Joi.string(),
    }),

    appointment: Joi.object({
        facilityId: Joi.string().required(),
        date: Joi.date().greater("now").required(),
        slotTime: Joi.string().required(),
        donationType: Joi.string()
            .valid("WHOLE_BLOOD", "PLASMA", "PLATELETS")
            .required(),
    }),

    bloodRequest: Joi.object({
        bloodGroups: Joi.array()
            .items(
                Joi.string().valid(
                    "A+",
                    "A-",
                    "B+",
                    "B-",
                    "AB+",
                    "AB-",
                    "O+",
                    "O-"
                )
            )
            .min(1)
            .required(),
        hospitalId: Joi.string().required(),
        urgencyLevel: Joi.string()
            .valid("LOW", "MEDIUM", "HIGH", "CRITICAL")
            .required(),
        patientInfo: Joi.object({
            name: Joi.string().required(),
            age: Joi.number(),
            gender: Joi.string(),
            condition: Joi.string(),
        }).required(),
        requiredBy: Joi.date().greater("now").required(),
    }),
};
