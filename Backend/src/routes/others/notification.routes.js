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

// 🔐 All routes below require authentication
router.use(verifyJWT);

// 📬 Get all notifications for the logged-in user
router.get('/', getNotifications);

// ✅ Mark a single notification as read
router.patch('/:notificationId/read', markAsRead);

// ✅ Mark all notifications as read
router.patch('/mark-all-read', markAllAsRead);

// ⚙️ Get user notification preferences
router.get('/preferences', getPreferences);

// 🛠️ Update user notification preferences
router.put('/preferences', updatePreferences);

// 📊 Get notification stats (unread count, types, etc.)
router.get('/stats', getNotificationStats);

// ❌ Delete a specific notification
router.delete('/:notificationId', deleteNotification);

export default router;
