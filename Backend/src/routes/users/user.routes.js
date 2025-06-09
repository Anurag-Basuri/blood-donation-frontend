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
import { userValidationRules } from "../../validations/user.validations.js";

const router = express.Router();

// Auth Routes
router.post(
    "/register",
    rateLimiter({
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 5, // 5 registrations per hour
    }),
    validateRequest(userValidationRules.register),
    registerUser
);

router.post(
    "/login",
    rateLimiter({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 5, // 5 login attempts
    }),
    validateRequest(userValidationRules.login),
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
        validateRequest(userValidationRules.profileUpdate),
        updateProfile
    );

router.patch(
    "/change-password",
    verifyUser,
    validateRequest(userValidationRules.passwordChange),
    changePassword
);

router.patch(
    "/emergency-contact",
    verifyUser,
    validateRequest(userValidationRules.emergencyContact),
    updateEmergencyContact
);

// Donation Management Routes
router.post(
    "/appointments",
    verifyUser,
    validateRequest(userValidationRules.appointment),
    bookDonationAppointment
);

router.get("/donations/history", verifyUser, getDonationHistory);

// Blood Request Routes
router.post(
    "/blood-requests",
    verifyUser,
    validateRequest(userValidationRules.bloodRequest),
    createBloodRequest
);

router.get("/requests/history", verifyUser, getRequestHistory);

// Notification Routes
router.get("/notifications", verifyUser, getNotifications);
router.patch("/notifications/mark-read", verifyUser, markNotificationsRead);

export default router;
