import express from 'express';
import {
	registerUser,
	loginUser,
	logoutUser,
	refreshAccessToken,
	updateProfile,
	changePassword,
	getDonationHistory,
	getUserActivities,
	getNotifications,
	markNotificationsRead,
	getUserProfile,
	getCurrentUser,
	deleteUserAccount,
	verifyPhoneNumber,
	verifyPhoneOTP,
	sendVerificationEmail,
	verifyEmail,
} from '../../controllers/users/user.controller.js';
import { verifyJWT } from '../../middleware/auth.middleware.js';
import { validateRequest } from '../../middleware/validator.middleware.js';
import { userValidationRules } from '../../validations/user.validations.js';

const router = express.Router();

// User registration
router.post('/register', validateRequest(userValidationRules.register), registerUser);

// User login
router.post('/login', validateRequest(userValidationRules.login), loginUser);
// User logout
router.use(verifyJWT);
router.post('/logout', verifyJWT, logoutUser);


export default router;
