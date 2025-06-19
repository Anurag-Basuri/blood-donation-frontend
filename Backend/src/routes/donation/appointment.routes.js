import { Router } from 'express';
import { validateRequest } from '../../middleware/validator.middleware.js';
import { verifyJWT } from '../../middleware/auth.middleware.js';
import {
	createAppointment,
	updateAppointment,
	sendReminder,
	APPOINTMENT_STATUS,
} from '../../controllers/donation/appointment.controller.js';

const router = Router();

// Protect all appointment routes
router.use(verifyJWT);

// Create appointment with rate limiting
router.post('/', validateRequest('appointment.create'), createAppointment);

// Update appointment
router.patch('/:appointmentId', validateRequest('appointment.update'), updateAppointment);

// Send reminder
router.post('/:appointmentId/remind', validateRequest('appointment.reminder'), sendReminder);

// Error handler
router.use((err, req, res, next) => {
	if (err.name === 'ValidationError') {
		return res.status(400).json({
			success: false,
			message: err.message,
		});
	}
	next(err);
});

export default router;
