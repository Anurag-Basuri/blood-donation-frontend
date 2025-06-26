import express from 'express';
import {
	registerAdmin,
	loginAdmin,
	getAdminDashboardData,
	getAdminProfile,
	updateAdminProfile,
	changeAdminPassword,
	deleteAdminAccount,
	warnUser,
	deactivateUserAccount,
	reactivateUserAccount,
	warnNGO,
	deactivateNGOAccount,
	reactivateNGOAccount,
	approveNGODocs,
	getNGODocuments,
	getNGOCampsAndCenters,
	warnHospital,
	deactivateHospitalAccount,
	reactivateHospitalAccount,
	approveHospitalDocs,
	getHospitalDocuments,
	getAllBloodRequests,
	getAllOrganRequests,
	getAllPlasmaRequests,
} from '../../controllers/users/admin.controller.js';
import { verifyJWT, requireRoles } from '../../middleware/auth.middleware.js';
import { validateRequest } from '../../middleware/validator.middleware.js';
import { adminValidationRules } from '../../validations/admin.validations.js';

const router = express.Router();

// ✅ Public Admin Routes
router.post('/register', validateRequest(adminValidationRules.register), registerAdmin);
router.post('/login', validateRequest(adminValidationRules.login), loginAdmin);

// 🔐 Protected Admin Routes
router.use(verifyJWT, requireRoles(['admin']));

// 🧑‍💼 Admin Profile
router.get('/dashboard', getAdminDashboardData);
router.get('/profile', getAdminProfile);
router.put('/profile', validateRequest(adminValidationRules.updateProfile), updateAdminProfile);
router.put(
	'/change-password',
	validateRequest(adminValidationRules.changePassword),
	changeAdminPassword,
);
router.delete('/delete-account', deleteAdminAccount);

// 👤 User Management
router.put('/user/:userId/warn', warnUser);
router.put('/user/:userId/deactivate', deactivateUserAccount);
router.put('/user/:userId/reactivate', reactivateUserAccount);

// 🏥 Hospital Management
router.put('/hospital/:hospitalId/warn', warnHospital);
router.put('/hospital/:hospitalId/deactivate', deactivateHospitalAccount);
router.put('/hospital/:hospitalId/reactivate', reactivateHospitalAccount);
router.put('/hospital/:hospitalId/approve-docs', approveHospitalDocs);
router.get('/hospital/:hospitalId/documents', getHospitalDocuments);

// 🏢 NGO Management
router.put('/ngo/:ngoId/warn', warnNGO);
router.put('/ngo/:ngoId/deactivate', deactivateNGOAccount);
router.put('/ngo/:ngoId/reactivate', reactivateNGOAccount);
router.put('/ngo/:ngoId/approve-docs', approveNGODocs);
router.get('/ngo/:ngoId/documents', getNGODocuments);
router.get('/ngo/:ngoId/camps-and-centers', getNGOCampsAndCenters);

// 🩸 Donation Requests
router.get('/blood-requests', getAllBloodRequests);
router.get('/organ-requests', getAllOrganRequests);
router.get('/plasma-requests', getAllPlasmaRequests);

export default router;
