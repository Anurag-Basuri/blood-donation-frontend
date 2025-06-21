import mongoose from 'mongoose';
import { ApiError } from '../../utils/ApiError.js';

const TIME_SLOTS = {
	MORNING: 'Morning',
	AFTERNOON: 'Afternoon',
	EVENING: 'Evening',
};

const APPOINTMENT_STATUS = {
	SCHEDULED: 'Scheduled',
	CONFIRMED: 'Confirmed',
	IN_PROGRESS: 'In Progress',
	COMPLETED: 'Completed',
	CANCELLED: 'Cancelled',
	RESCHEDULED: 'Rescheduled',
	NO_SHOW: 'No Show',
	DEFERRED: 'Deferred',
};

const appointmentSchema = new mongoose.Schema(
	{
		appointmentId: {
			type: String,
			unique: true,
			default: () => `APT${Date.now()}`,
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			index: true,
		},
		centerId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Center',
			required: true,
		},
		date: {
			type: Date,
			required: true,
			validate: {
				validator: date => date > new Date(),
				message: 'Appointment date must be in the future',
			},
		},
		timeSlot: {
			type: String,
			enum: Object.values(TIME_SLOTS),
			required: true,
		},
		status: {
			type: String,
			enum: Object.values(APPOINTMENT_STATUS),
			default: APPOINTMENT_STATUS.SCHEDULED,
		},
		healthInformation: {
			hemoglobin: {
				type: Number,
				min: 12.5,
				max: 20,
			},
			bloodPressure: {
				systolic: {
					type: Number,
					min: 90,
					max: 180,
				},
				diastolic: {
					type: Number,
					min: 60,
					max: 100,
				},
			},
			weight: {
				type: Number,
				min: 50,
			},
			temperature: {
				type: Number,
				min: 35.5,
				max: 37.5,
			},
			pulseRate: {
				type: Number,
				min: 60,
				max: 100,
			},
			recordedAt: {
				type: Date,
				default: Date.now,
			},
		},
		donationId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'BloodDonation',
		},
		statusHistory: [
			{
				status: {
					type: String,
					enum: Object.values(APPOINTMENT_STATUS),
				},
				updatedBy: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'User',
					required: true,
				},
				reason: String,
				updatedAt: {
					type: Date,
					default: Date.now,
				},
			},
		],
		cancellationReason: String,
		rescheduleCount: {
			type: Number,
			default: 0,
			max: 3,
		},
		reminders: [
			{
				type: {
					type: String,
					enum: ['SMS', 'Email', 'Push'],
				},
				sentAt: Date,
				status: String,
			},
		],
		notes: {
			public: String,
			internal: String,
		},
	},
	{
		timestamps: true,
	},
);

// Indexes
appointmentSchema.index({ date: 1, status: 1 });
appointmentSchema.index({ centerId: 1, date: 1 });
appointmentSchema.index({ userId: 1, date: -1 });

// Instance Methods
appointmentSchema.methods = {
	async updateStatus(newStatus, userId, reason) {
		if (!Object.values(APPOINTMENT_STATUS).includes(newStatus)) {
			throw new ApiError(400, 'Invalid status');
		}

		this.status = newStatus;
		this.statusHistory.push({
			status: newStatus,
			updatedBy: userId,
			reason,
			updatedAt: new Date(),
		});

		return this.save();
	},

	canReschedule() {
		return this.rescheduleCount < 3 && ['Scheduled', 'Confirmed'].includes(this.status);
	},

	isWithinCancellationWindow() {
		const hoursToAppointment = (this.date - new Date()) / (1000 * 60 * 60);
		return hoursToAppointment >= 24;
	},
};

// Static Methods
appointmentSchema.statics = {
	async findUpcoming(userId) {
		return this.find({
			userId,
			date: { $gt: new Date() },
			status: { $in: [APPOINTMENT_STATUS.SCHEDULED, APPOINTMENT_STATUS.CONFIRMED] },
		}).sort({ date: 1 });
	},

	async findSlotAvailability(centerId, date) {
		const start = new Date(date);
		start.setHours(0, 0, 0, 0);
		const end = new Date(date);
		end.setHours(23, 59, 59, 999);

		return this.aggregate([
			{
				$match: {
					centerId: mongoose.Types.ObjectId(centerId),
					date: { $gte: start, $lte: end },
					status: { $in: [APPOINTMENT_STATUS.SCHEDULED, APPOINTMENT_STATUS.CONFIRMED] },
				},
			},
			{
				$group: {
					_id: '$timeSlot',
					count: { $sum: 1 },
				},
			},
		]);
	},
};

// Pre-save Hook
appointmentSchema.pre('save', function (next) {
	if (this.isNew) {
		this.statusHistory = [
			{
				status: this.status,
				updatedBy: this.userId,
				updatedAt: new Date(),
			},
		];
	}
	next();
});

const DonationAppointment = mongoose.model('DonationAppointment', appointmentSchema);
export { DonationAppointment, TIME_SLOTS, APPOINTMENT_STATUS };
