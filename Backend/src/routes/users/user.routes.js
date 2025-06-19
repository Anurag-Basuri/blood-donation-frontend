import express from 'express';
import {
	registerUser,
	loginUser,
	logoutUser,
	refreshAccessToken,
	updateProfile,
	getDonationHistory,
	getNotifications,
	markNotificationsRead,
	getCurrentUser,
	changePassword,
	getUserProfile,
} from '../../controllers/users/user.controller.js';
import { verifyJWT } from '../../middleware/auth.middleware.js';
import { validateRequest } from '../../middleware/validator.middleware.js';
import { userValidationRules } from '../../validations/user.validations.js';

const router = express.Router();

// Auth Routes
router.post('/register', validateRequest(userValidationRules.register), registerUser);

router.post('/login', validateRequest(userValidationRules.login), loginUser);

router.post('/logout', verifyJWT, logoutUser);
router.post('/refresh-token', refreshAccessToken);

// Profile Management
router
	.route('/profile')
	.get(verifyJWT, getCurrentUser)
	.patch(verifyJWT, validateRequest(userValidationRules.profileUpdate), updateProfile);

router.patch(
	'/change-password',
	verifyJWT,
	validateRequest(userValidationRules.passwordChange),
	changePassword,
);

// Donation History
router.get('/donations/history', verifyJWT, getDonationHistory);

// Other Users' Profile
router.get(
	'/profile/:userId',
	verifyJWT,
	(req, res, next) => {
		// Convert `params` to match Joi validation input
		req.body = { userId: req.params.userId };
		next();
	},
	validateRequest(userValidationRules.getUserProfile),
	getUserProfile,
);

// Notifications
router.get('/notifications', verifyJWT, getNotifications);
router.patch('/notifications/mark-read', verifyJWT, markNotificationsRead);

export default router;
