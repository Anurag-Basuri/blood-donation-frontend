import { Router } from 'express';
import { uploadFields, handleMulterError } from '../../middleware/multer.middleware.js';
import { validateRequest } from '../../middleware/validator.middleware.js';
import { verifyJWT, requireRoles } from '../../middleware/auth.middleware.js';
import { ngoValidationRules } from '../../validations/ngo.validations.js';
import {
	registerNGO,
	loginNGO,
	logoutNGO,
	changePassword,
	uploadDocuments,
	uploadLogo,
	updateNGOProfile,
	manageBloodInventory,
	getStatistics,
	recalculateStatistics,
	getSettings,
	updateSettings,
	getCurrentNGO,
	getNGOProfile,
	searchNGOs,
	getNGOAnalytics,
	sendNGOVerificationEmail,
	verifyNGOEmail,
	getAllNGOs,
} from '../../controllers/users/ngo.controller.js';

const router = Router();

/* 🔓 Public Routes */
router.post(
	'/register',
	uploadFields([
		{ name: 'documents', maxCount: 5 },
		{ name: 'logo', maxCount: 1 },
	]),
	handleMulterError,
	validateRequest(ngoValidationRules.register),
	registerNGO
);

router.post('/login', validateRequest(ngoValidationRules.login), loginNGO);
router.post('/verify-email', verifyNGOEmail);
router.post('/send-verification-email', sendNGOVerificationEmail);

// 🩸 Search NGOs
router.get('/search', searchNGOs);
router.get('/profile/:ngoId', getNGOProfile);
router.get('/analytics', getNGOAnalytics);

// ⚙️ Health Check (Testing/Monitoring)
router.get('/health', (req, res) => {
	res.status(200).json({
		status: 'healthy',
		timestamp: new Date(),
	});
});

/* 🔐 Protected Routes (NGO only) */
router.use(verifyJWT, requireRoles(['ngo']));

router.post('/logout', logoutNGO);
router.put('/change-password', validateRequest(ngoValidationRules.changePassword), changePassword);

// 🧾 NGO Profile Management
router.put('/profile', validateRequest(ngoValidationRules.update), updateNGOProfile);
router.post('/upload-documents', uploadFields([{ name: 'documents', maxCount: 5 }]), handleMulterError, uploadDocuments);
router.post('/upload-logo', uploadFields([{ name: 'logo', maxCount: 1 }]), handleMulterError, uploadLogo);

// 🔄 Blood Inventory
router.put('/inventory', manageBloodInventory);

// 📊 Statistics
router.get('/stats', getStatistics);
router.post('/stats/recalculate', recalculateStatistics);

// ⚙️ NGO Settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

// 👤 Self Info
router.get('/me', getCurrentNGO);

// 🔐 Admin Access (if needed)
router.get('/all', requireRoles(['admin']), getAllNGOs);

export default router;
