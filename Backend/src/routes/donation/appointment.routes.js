import { Router } from 'express';
import { validateRequest } from '../../middleware/validator.middleware.js';
import { verifyJWT } from '../../middleware/auth.middleware.js';
import {
	createAppointment,
	updateAppointment,
	sendReminder,
	getMyAppointments,
	getAppointmentById,
} from '../../controllers/donation/appointment.controller.js';

const router = Router();

// Protect all appointment routes
router.use(verifyJWT);

// Create a new appointment
router.post('/', validateRequest('createAppointment'), createAppointment);

// Update an existing appointment
router.put('/:id', validateRequest('updateAppointment'), updateAppointment);

// Send a reminder for an appointment
router.post('/:id/reminder', validateRequest('sendReminder'), sendReminder);

// Get all appointments for the authenticated user
router.get('/', getMyAppointments);

// Get appointment details by ID
router.get('/:id', getAppointmentById);

export default router;
