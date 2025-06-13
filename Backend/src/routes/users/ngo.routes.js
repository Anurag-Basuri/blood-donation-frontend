import { Router } from 'express';
import {
    uploadFields,
    handleMulterError,
} from "../../middleware/multer.middleware.js";
import { validateRequest } from "../../middleware/validator.middleware.js";
import { verifyJWT } from "../../middleware/auth.middleware.js";
import { rateLimiter } from "../../middleware/rateLimit.middleware.js";
import {
    registerNGO,
    loginNGO,
    logoutNGO,
    changePassword,
    getNGOProfile,
    updateNGOProfile,
    manageFacility,
    handleBloodRequest,
    updateBloodInventory,
    getConnectedHospitals,
    respondToConnectionRequest,
    getNGOAnalytics,
    resendVerificationOtp,
} from "../../controllers/users/ngo.controller.js";

const router = Router();

// File upload configurations
const documentUpload = uploadFields([
    { name: "logo", maxCount: 1 },
    { name: "registrationCert", maxCount: 1 },
    { name: "licenseCert", maxCount: 1 },
    { name: "taxExemptionCert", maxCount: 1 },
]);

// Auth Routes (Public)
router.post(
    "/register",
    rateLimiter({
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 3, // 3 registration attempts per hour
    }),
    documentUpload,
    handleMulterError,
    validateRequest("ngo.register"),
    registerNGO
);

router.post(
    "/login",
    rateLimiter({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 5, // 5 login attempts
    }),
    validateRequest("ngo.login"),
    loginNGO
);

router.post(
    "/resend-otp",
    validateRequest("ngo.resendOTP"),
    resendVerificationOtp
);

// Protected Routes (Require Authentication)
router.use(verifyJWT);

// Profile Management
router.get("/logout", logoutNGO);

router
    .route("/profile")
    .get(getNGOProfile)
    .patch(
        documentUpload,
        handleMulterError,
        validateRequest("ngo.profileUpdate"),
        updateNGOProfile
    );

router.post(
    "/change-password",
    validateRequest("ngo.passwordChange"),
    changePassword
);

// Facility Management
router
    .route("/facilities")
    .post(validateRequest("ngo.facilityCreate"), manageFacility)
    .get(validateRequest("ngo.facilityList"), async (req, res) => {
        req.params.action = "LIST";
        await manageFacility(req, res);
    });

router
    .route("/facilities/:facilityId")
    .patch(validateRequest("ngo.facilityUpdate"), async (req, res) => {
        req.params.action = "UPDATE";
        await manageFacility(req, res);
    })
    .delete(async (req, res) => {
        req.params.action = "DELETE";
        await manageFacility(req, res);
    });

// Blood Inventory Management
router
    .route("/inventory")
    .post(validateRequest("ngo.inventoryUpdate"), updateBloodInventory)
    .get(async (req, res) => {
        req.params.action = "GET";
        await updateBloodInventory(req, res);
    });

// Hospital Connections
router.get("/hospitals/connected", getConnectedHospitals);
router.post(
    "/hospitals/respond",
    validateRequest("ngo.connectionResponse"),
    respondToConnectionRequest
);

// Blood Request Management
router
    .route("/blood-requests/:requestId")
    .post(validateRequest("ngo.bloodRequestResponse"), handleBloodRequest);

// Analytics
router.get(
    "/analytics",
    validateRequest("ngo.analyticsQuery"),
    getNGOAnalytics
);

// Health Check
router.get("/health", (req, res) => {
    res.status(200).json({
        status: "healthy",
        ngoId: req.ngo?._id,
        timestamp: new Date(),
    });
});

export default router;