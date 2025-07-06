import { Router } from 'express';
import { uploadFields, handleMulterError } from '../../middleware/multer.middleware.js';
import { validateRequest } from '../../middleware/validator.middleware.js';
import { verifyJWT, requireRoles } from '../../middleware/auth.middleware.js';
import { hospitalValidationRules } from '../../validations/hospital.validations.js';
import {
	registerHospital,
	loginHospital,
	logoutHospital,
	changePassword,
	uploadDocument,
	getCurrentHospital,
	getHospitalProfile,
	updateHospitalProfile,
	uploadLogo,
	searchHospitals,
	updateBloodInventory,
	updateStatistics,
	getHospitalAnalytics,
	updateHospitalSettings,
	sendHospitalVerificationEmail,
	verifyHospitalEmail,
	getAllHospitals,
} from '../../controllers/users/hospital.controller.js';

const router = Router();

// ✅ Health Check
router.get('/health', (req, res) => {
	res.status(200).json({
		status: 'healthy',
		hospitalId: req.hospital?._id || null,
		timestamp: new Date(),
		version: process.env.API_VERSION || '1.0.0',
	});
});

// 🔓 Public Routes
router.post(
	'/register',
	uploadFields([
		{ name: 'documents', maxCount: 5 },
		{ name: 'logo', maxCount: 1 },
	]),
	handleMulterError,
	validateRequest(hospitalValidationRules.register),
	registerHospital,
);

router.post('/login', validateRequest(hospitalValidationRules.login), loginHospital);
router.post('/send-verification-email', sendHospitalVerificationEmail);
router.post('/verify-email', verifyHospitalEmail);
router.get('/search', searchHospitals);
router.get('/profile/:hospitalId', getHospitalProfile);
router.get('/analytics', getHospitalAnalytics);

// 🔐 Protected Routes (hospital only)
router.use(verifyJWT, requireRoles(['hospital']));

router.post('/logout', logoutHospital);
router.put(
	'/change-password',
	validateRequest(hospitalValidationRules.changePassword),
	changePassword,
);
router.put('/update-profile',
	validateRequest(hospitalValidationRules.update),
	updateHospitalProfile
);

router.put(
	'/upload-profile-picture',
	uploadFields([{ name: 'profilePicture', maxCount: 1 }]),
	handleMulterError,
	updateHospitalProfile
);

router.get('/me', getCurrentHospital);

// 📄 File Uploads
router.post(
	'/upload-documents',
	uploadFields([{ name: 'documents', maxCount: 5 }]),
	handleMulterError,
	uploadDocument,
);
router.post(
	'/upload-logo',
	uploadFields([{ name: 'logo', maxCount: 1 }]),
	handleMulterError,
	uploadLogo,
);

// 🩸 Inventory & Statistics
router.put('/inventory', updateBloodInventory);
router.put('/stats', updateStatistics);

// ⚙️ Hospital Settings
router.put('/settings', updateHospitalSettings);

// 🔐 Admin Access (optional route for admin overview)
router.get('/all', requireRoles(['admin']), getAllHospitals);

export default router;
