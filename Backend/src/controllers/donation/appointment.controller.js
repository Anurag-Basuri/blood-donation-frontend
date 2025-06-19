import { DonationAppointment } from '../../models/donation/appointment.models.js';
import { Facility, FACILITY_TYPE, FACILITY_STATUS } from '../../models/donation/facility.models.js';
import { Activity } from '../../models/others/activity.model.js';
import notificationService from '../../services/notification.service.js';
import aiService from '../../services/ai.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

// Appointment status enums
const APPOINTMENT_STATUS = {
	SCHEDULED: 'SCHEDULED',
	CONFIRMED: 'CONFIRMED',
	COMPLETED: 'COMPLETED',
	CANCELLED: 'CANCELLED',
	RESCHEDULED: 'RESCHEDULED',
	NO_SHOW: 'NO_SHOW',
};

const createAppointment = asyncHandler(async (req, res) => {
	const { facilityId, date, slotTime, bloodGroup, donationType } = req.body;
	const userId = req.user._id;

	// Enhanced validation
	if (!date || new Date(date) < new Date()) {
		throw new ApiError(400, 'Invalid appointment date');
	}

	// Check facility availability and validation
	const facility = await Facility.findOne({
		_id: facilityId,
		status: { $in: [FACILITY_STATUS.ACTIVE, FACILITY_STATUS.PLANNED] },
	});

	if (!facility) {
		throw new ApiError(404, 'Donation facility not found or inactive');
	}

	// Additional validation for camps
	if (facility.facilityType === FACILITY_TYPE.CAMP) {
		const campDate = new Date(date).setHours(0, 0, 0, 0);
		const startDate = new Date(facility.schedule.startDate).setHours(0, 0, 0, 0);
		const endDate = new Date(facility.schedule.endDate).setHours(23, 59, 59, 999);

		if (campDate < startDate || campDate > endDate) {
			throw new ApiError(400, 'Selected date is outside camp schedule');
		}
	}

	// Check registration status
	if (!facility.registration.isOpen) {
		throw new ApiError(400, 'Registration is closed for this facility');
	}

	// Find and validate slot
	const slot = facility.schedule.slots.find(
		s => s.date.toDateString() === new Date(date).toDateString() && s.startTime === slotTime,
	);

	if (!slot || slot.booked >= slot.capacity) {
		throw new ApiError(400, 'Selected time slot is not available');
	}

	// Validate donor eligibility
	const isEligible = await req.user.isEligibleToDonate();
	if (!isEligible.status) {
		throw new ApiError(400, `Not eligible to donate: ${isEligible.reason}`);
	}

	// Create appointment
	const appointment = await DonationAppointment.create({
		userId,
		facilityId,
		facilityType: facility.facilityType,
		date,
		slotTime,
		bloodGroup,
		donationType,
		status: APPOINTMENT_STATUS.SCHEDULED,
		donorDetails: {
			previousDonations: req.user.donations?.length || 0,
			healthInfo: req.user.healthInfo,
			specialNotes: req.user.medicalConditions,
		},
	});

	// Register donor in facility
	await facility.registerDonor(userId, slot._id);

	// Send notifications with enhanced information
	await Promise.all([
		notificationService.sendNotification('appointment-confirmation', req.user, {
			date: appointment.date,
			facility: facility.name,
			facilityType: facility.facilityType,
			donationType,
			sendSMS: true,
			metadata: {
				appointmentId: appointment._id,
				address: facility.contactInfo.address,
				contact: facility.contactInfo.person,
				instructions:
					facility.facilityType === FACILITY_TYPE.CAMP
						? 'Please bring valid ID and arrive 15 minutes early'
						: 'Please follow pre-donation guidelines',
				directions: await facility.getDirections(req.user.address?.location),
			},
		}),
		Activity.create({
			type: 'APPOINTMENT_CREATED',
			performedBy: { userId, userModel: 'User' },
			details: {
				appointmentId: appointment._id,
				facility: facility.name,
				facilityType: facility.facilityType,
				date,
				donationType,
			},
		}),
	]);

	return res
		.status(201)
		.json(new ApiResponse(201, { appointment }, 'Appointment scheduled successfully'));
});

const updateAppointment = asyncHandler(async (req, res) => {
	const { appointmentId } = req.params;
	const { status, reason, newDate, newSlotTime } = req.body;

	const appointment = await DonationAppointment.findById(appointmentId)
		.populate('facilityId')
		.populate('userId', 'email phone');

	if (!appointment) {
		throw new ApiError(404, 'Appointment not found');
	}

	// Handle rescheduling
	if (newDate && newSlotTime) {
		const isNewSlotAvailable = await appointment.facilityId.checkSlotAvailability(
			newDate,
			newSlotTime,
		);

		if (!isNewSlotAvailable) {
			throw new ApiError(400, 'New time slot is not available');
		}

		// Release old slot and reserve new one
		await Promise.all([
			appointment.facilityId.releaseSlot(appointment.date, appointment.slotTime),
			appointment.facilityId.reserveSlot(newDate, newSlotTime),
		]);

		appointment.date = newDate;
		appointment.slotTime = newSlotTime;
		appointment.status = APPOINTMENT_STATUS.RESCHEDULED;
	} else if (status) {
		appointment.status = status;
		appointment.statusReason = reason;

		// Release slot if cancelled
		if (status === APPOINTMENT_STATUS.CANCELLED) {
			await appointment.facilityId.releaseSlot(appointment.date, appointment.slotTime);
		}
	}

	await appointment.save();

	// Send notifications based on update type
	const notificationType =
		status === APPOINTMENT_STATUS.CANCELLED
			? 'appointment-cancelled'
			: newDate
				? 'appointment-rescheduled'
				: 'appointment-update';

	await notificationService.sendNotification(notificationType, appointment.userId, {
		date: appointment.date,
		facility: appointment.facilityId.name,
		status: appointment.status,
		reason,
		sendSMS: true,
		metadata: {
			appointmentId: appointment._id,
			newDate,
			newSlotTime,
		},
	});

	return res
		.status(200)
		.json(new ApiResponse(200, { appointment }, 'Appointment updated successfully'));
});

const sendReminder = asyncHandler(async (req, res) => {
	const { appointmentId } = req.params;

	const appointment = await DonationAppointment.findById(appointmentId)
		.populate('facilityId', 'name address donationInstructions requirements')
		.populate('userId', 'email phone address');

	if (!appointment) {
		throw new ApiError(404, 'Appointment not found');
	}

	// Get traffic and weather information
	const [trafficInfo, weatherInfo] = await Promise.all([
		aiService.getTrafficEstimate(
			appointment.userId.address?.location,
			appointment.facilityId.address.location,
			appointment.date,
		),
		aiService.getWeatherForecast(appointment.facilityId.address.location, appointment.date),
	]);

	// Send comprehensive reminder
	await notificationService.sendNotification('donation-reminder', appointment.userId, {
		nextDonationDate: appointment.date,
		facility: appointment.facilityId.name,
		sendSMS: true,
		metadata: {
			appointmentId: appointment._id,
			instructions: appointment.facilityId.donationInstructions,
			requirements: appointment.facilityId.requirements,
			trafficInfo,
			weatherInfo,
			directions: await appointment.facilityId.getDirections(
				appointment.userId.address?.location,
			),
		},
	});

	return res.status(200).json(new ApiResponse(200, {}, 'Reminder sent successfully'));
});

export { createAppointment, updateAppointment, sendReminder, APPOINTMENT_STATUS };
