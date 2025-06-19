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

// Protect all notification routes
router.use(verifyJWT);

// Get notifications with pagination and filtering
router.get('/', validateRequest('notification.list'), getNotifications);

// Mark notification as read
router.patch('/:notificationId/read', validateRequest('notification.markRead'), markAsRead);

// Mark all notifications as read
router.patch('/read-all', validateRequest('notification.markAllRead'), markAllAsRead);

// Notification preferences
router
	.route('/preferences')
	.get(getPreferences)
	.patch(validateRequest('notification.updatePreferences'), updatePreferences);

// Get notification statistics
router.get('/stats', getNotificationStats);

// Delete notification
router.delete('/:notificationId', validateRequest('notification.delete'), deleteNotification);

// Error handler
router.use((err, req, res, next) => {
	console.error('Notification Error:', err);
	if (err.name === 'ValidationError') {
		return res.status(400).json({
			success: false,
			message: err.message,
		});
	}
	next(err);
});

export default router;
