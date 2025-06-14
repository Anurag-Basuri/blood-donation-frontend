import { Router } from 'express';
import {
    uploadFields,
    handleMulterError,
} from "../../middleware/multer.middleware.js";
import { validateRequest } from "../../middleware/validator.middleware.js";
import { verifyJWT } from "../../middleware/auth.middleware.js";
import { rateLimiter } from "../../middleware/rateLimit.middleware.js";
import {
    registerHospital,
    createBloodRequest,
    updateBloodInventory,
    manageNGOConnections,
    getHospitalAnalytics,
    loginHospital,
    logoutHospital,
    refreshAccessToken,
    changePassword,
    findNearbyNGOs,
    getHospitalProfile,
    updateEmergencyContact,
    updateHospitalProfile,
} from "../../controllers/users/hospital.controller.js";

const router = Router();

// File upload configurations
const documentUpload = uploadFields([
    { name: "license", maxCount: 1 },
    { name: "accreditation", maxCount: 1 },
    { name: "registration", maxCount: 1 },
]);

// Public routes with rate limiting
router.post(
    "/register",
    documentUpload,
    handleMulterError,
    validateRequest("hospital.register"),
    registerHospital
);

router.post(
    "/login",
    validateRequest("hospital.login"),
    loginHospital
);

router.post("/refresh-token", refreshAccessToken);

// Protected routes
router.use(verifyJWT);

// Profile Management
router.get("/logout", logoutHospital);

router
    .route("/profile")
    .get(getHospitalProfile)
    .patch(
        documentUpload,
        handleMulterError,
        validateRequest("hospital.profileUpdate"),
        updateHospitalProfile
    );

router.patch(
    '/change-password',
    validateRequest('hospital.passwordChange'),
    changePassword
);

router.patch(
    '/emergency-contact',
    validateRequest('hospital.emergencyContact'),
    updateEmergencyContact
);

// Blood Bank Management
router.route('/blood-inventory')
    .patch(
        validateRequest('hospital.inventoryUpdate'),
        updateBloodInventory
    )
    .get(
        validateRequest('hospital.inventoryQuery'),
        (req, res) => {
            req.query.type = 'inventory';
            return getHospitalAnalytics(req, res);
        }
    );

// Blood Request Management
// router.route('/blood-requests')
//     .post(
//         validateRequest('hospital.bloodRequest'),
//         createBloodRequest
//     )
//     .get(
//         validateRequest('hospital.requestHistory'),
//         getBloodRequestHistory
//     );

// NGO Network Management
router.get(
    '/nearby-ngos',
    validateRequest('hospital.nearbySearch'),
    findNearbyNGOs
);

router.route('/ngo-connections/:ngoId')
    .post(
        validateRequest('hospital.connectionCreate'),
        (req, res) => {
            req.params.action = 'connect';
            return manageNGOConnections(req, res);
        }
    )
    .patch(
        validateRequest('hospital.connectionUpdate'),
        (req, res) => {
            req.params.action = 'update';
            return manageNGOConnections(req, res);
        }
    )
    .delete(
        validateRequest('hospital.connectionDelete'),
        (req, res) => {
            req.params.action = 'disconnect';
            return manageNGOConnections(req, res);
        }
    );

// Analytics
router.get(
    '/analytics',
    validateRequest('hospital.analytics'),
    getHospitalAnalytics
);

// Health Check
router.get('/health', (req, res) => {
    res.status(200).json({
        status: "healthy",
        hospitalId: req.hospital?._id,
        timestamp: new Date(),
        version: process.env.API_VERSION || "1.0.0",
    });
});

export default router;