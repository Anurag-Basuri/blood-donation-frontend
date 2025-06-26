import { Router } from 'express';
import { validateRequest } from '../../middleware/validator.middleware.js';
import { verifyJWT } from '../../middleware/auth.middleware.js';
import {
	getNotifications,
	markAsRead,
	markAllAsRead,
	getPreferences,
	updatePreferences,
	getNotificationStats,
	deleteNotification,
} from '../../controllers/others/notification.controller.js';

const router = Router();


export default router;
