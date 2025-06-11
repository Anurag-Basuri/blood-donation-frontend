import { Router } from 'express';
import { upload } from '../../middleware/multer.middleware.js';
import { validateRequest } from "../../middleware/validator.middleware.js";
import { verifyJWT } from '../../middleware/auth.middleware.js';
import { rateLimiter } from '../../middleware/rateLimit.middleware.js';
import {
    registerHospital,
    verifyHospitalEmail,
    loginHospital,
    logoutHospital,
    refreshAccessToken,
    getHospitalProfile,
    updateHospitalProfile,
    updateBloodInventory,
    createBloodRequest,
    findNearbyNGOs,
    manageNGOConnections,
    getHospitalAnalytics,
    updateEmergencyContact,
    changePassword
} from '../../controllers/users/hospital.controller.js';

const router = Router();

// File upload configurations
const documentUpload = upload.fields([
    { name: 'license', maxCount: 1 },
    { name: 'accreditation', maxCount: 1 },
    { name: 'registration', maxCount: 1 }
]);

// Public routes with rate limiting
router.post(
    '/register',
    rateLimiter({
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 3 // 3 registration attempts per hour
    }),
    documentUpload,
    validateRequest('hospital.register'),
    registerHospital
);

router.post(
    '/login',
    rateLimiter({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 5 // 5 login attempts
    }),
    validateRequest('hospital.login'),
    loginHospital
);

router.post(
    '/verify-email',
    validateRequest('hospital.emailVerification'),
    verifyHospitalEmail
);

router.post('/refresh-token', refreshAccessToken);

// Protected routes
router.use(verifyJWT);

// Profile Management
router.get('/logout', logoutHospital);

router.route('/profile')
    .get(getHospitalProfile)
    .patch(
        documentUpload,
        validateRequest('hospital.profileUpdate'),
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
router.route('/blood-requests')
    .post(
        validateRequest('hospital.bloodRequest'),
        createBloodRequest
    )
    .get(
        validateRequest('hospital.requestHistory'),
        getBloodRequestHistory
    );

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