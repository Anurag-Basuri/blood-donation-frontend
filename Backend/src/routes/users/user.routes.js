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
import { verifyJWT } from "../../middleware/auth.middleware.js";
import { validateRequest } from "../../middleware/validator.middleware.js";
import { rateLimiter } from "../../middleware/rateLimit.middleware.js";
import { userValidationRules } from "../../validations/user.validations.js";

const router = express.Router();

// Auth Routes
router.post(
    "/register",
    validateRequest(userValidationRules.register),
    registerUser
);

router.post(
    "/login",
    validateRequest(userValidationRules.login),
    loginUser
);

router.post("/logout", verifyJWT, logoutUser);
router.post("/refresh-token", refreshAccessToken);

// Profile Management Routes
router
    .route("/profile")
    .get(verifyJWT, getCurrentUser)
    .patch(
        verifyJWT,
        validateRequest(userValidationRules.profileUpdate),
        updateProfile
    );

router.patch(
    "/change-password",
    verifyJWT,
    validateRequest(userValidationRules.passwordChange),
    changePassword
);

router.patch(
    "/emergency-contact",
    verifyJWT,
    validateRequest(userValidationRules.emergencyContact),
    updateEmergencyContact
);

// Donation Management Routes
router.post(
    "/appointments",
    verifyJWT,
    validateRequest(userValidationRules.appointment),
    bookDonationAppointment
);

router.get("/donations/history", verifyJWT, getDonationHistory);

// Blood Request Routes
router.post(
    "/blood-requests",
    verifyJWT,
    validateRequest(userValidationRules.bloodRequest),
    createBloodRequest
);

router.get("/requests/history", verifyJWT, getRequestHistory);

// Notification Routes
router.get("/notifications", verifyJWT, getNotifications);
router.patch("/notifications/mark-read", verifyJWT, markNotificationsRead);

export default router;
