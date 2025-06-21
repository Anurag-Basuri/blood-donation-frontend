// controllers/donation/appointment.controller.js
import { DonationAppointment } from '../../models/donation/appointment.models.js';
import { Facility } from '../../models/donation/facility.models.js';
import { Activity } from '../../models/others/activity.model.js';
import notificationService from '../../services/notification.service.js';
import aiService from '../../services/ai.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

const APPOINTMENT_STATUS = {
	SCHEDULED: 'SCHEDULED',
	RESCHEDULED: 'RESCHEDULED',
	CANCELLED: 'CANCELLED',
};

const createAppointment = asyncHandler(async (req, res) => {
	const {
		facilityId,
		date,
		slotTime,
		bloodGroup,
		donationType
	} = req.body;
	const user = req.user;

	if (!facilityId || !date || !slotTime || !bloodGroup || !donationType) {
		throw new ApiError(400, 'All fields are required');
	}

	const facility = await Facility.findById(facilityId);
	if (!facility || !facility.registration?.isOpen) {
		throw new ApiError(404, 'Facility not available for registration');
	}

	const isEligible = await user.isEligibleToDonate();
	if (!isEligible.status) {
		throw new ApiError(400, `Not eligible to donate: ${isEligible.reason}`);
	}

	const slot = facility.schedule.slots.find(
		s => s.date.toDateString() === new Date(date).toDateString() && s.startTime === slotTime,
	);
	if (!slot || slot.booked >= slot.capacity) {
		throw new ApiError(400, 'Selected slot is not available');
	}

	const appointment = await DonationAppointment.create({
		userId: user._id,
		facilityId,
		date,
		slotTime,
		bloodGroup,
		donationType,
		status: APPOINTMENT_STATUS.SCHEDULED,
	});

	await facility.registerDonor(user._id, slot._id);

	await notificationService.sendNotification('appointment-confirmation', user, {
		date,
		facility: facility.name,
		sendSMS: true,
	});

	await Activity.create({
		type: 'APPOINTMENT_CREATED',
		performedBy: { userId: user._id, userModel: 'User' },
		details: { appointmentId: appointment._id, facility: facility.name, date },
	});

	res
		.status(201)
		.json(
			new ApiResponse(
				201,
				{ appointment },
				'Appointment created'
			)
		);
});

const updateAppointment = asyncHandler(async (req, res) => {
	const { appointmentId } = req.params;
	const { status, newDate, newSlotTime } = req.body;

	const appointment = await DonationAppointment.findById(appointmentId).populate('facilityId');
	if (!appointment) throw new ApiError(404, 'Appointment not found');

	if (status === APPOINTMENT_STATUS.CANCELLED) {
		appointment.status = APPOINTMENT_STATUS.CANCELLED;
		await appointment.facilityId.releaseSlot(appointment.date, appointment.slotTime);
	} else if (newDate && newSlotTime) {
		const available = await appointment.facilityId.checkSlotAvailability(newDate, newSlotTime);
		if (!available) throw new ApiError(400, 'New slot not available');

		await appointment.facilityId.releaseSlot(appointment.date, appointment.slotTime);
		await appointment.facilityId.reserveSlot(newDate, newSlotTime);

		appointment.date = newDate;
		appointment.slotTime = newSlotTime;
		appointment.status = APPOINTMENT_STATUS.RESCHEDULED;
	}

	await appointment.save();

	res
		.status(200)
		.json(
			new ApiResponse
				(
					200,
					{ appointment }, 'Appointment updated'
				)
		);
});

const sendReminder = asyncHandler(async (req, res) => {
	const { appointmentId } = req.params;
	const appointment = await DonationAppointment.findById(appointmentId)
		.populate('facilityId')
		.populate('userId');

	if (!appointment) throw new ApiError(404, 'Appointment not found');

	const directions = await appointment.facilityId.getDirections(
		appointment.userId.address?.location,
	);
	const trafficInfo = await aiService.getTrafficEstimate(
		appointment.userId.address?.location,
		appointment.facilityId.address.location,
		appointment.date,
	);
	const weatherInfo = await aiService.getWeatherForecast(
		appointment.facilityId.address.location,
		appointment.date,
	);

	await notificationService.sendNotification('donation-reminder', appointment.userId, {
		date: appointment.date,
		facility: appointment.facilityId.name,
		sendSMS: true,
		metadata: { directions, trafficInfo, weatherInfo },
	});

	res
		.status(200)
		.json(
			new ApiResponse(
				200, {}, 'Reminder sent'
			)
		);
});

export { createAppointment, updateAppointment, sendReminder, APPOINTMENT_STATUS };
