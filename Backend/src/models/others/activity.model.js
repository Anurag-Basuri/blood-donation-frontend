import mongoose from 'mongoose';

const ACTIVITY_TYPES = {
	// User Activities
	USER_LOGIN: 'user_login',
	USER_REGISTERED: 'user_registered',
	PROFILE_UPDATED: 'profile_updated',
	PASSWORD_CHANGED: 'password_changed',

	// Donation Related
	DONATION_REQUESTED: 'donation_requested',
	DONATION_COMPLETED: 'donation_completed',
	APPOINTMENT_BOOKED: 'appointment_booked',
	APPOINTMENT_CANCELLED: 'appointment_cancelled',

	// Blood Bank Activities
	BLOOD_RECEIVED: 'blood_received',
	BLOOD_ISSUED: 'blood_issued',
	INVENTORY_UPDATED: 'inventory_updated',

	// Camp Activities
	CAMP_CREATED: 'camp_created',
	CAMP_UPDATED: 'camp_updated',
	CAMP_CANCELLED: 'camp_cancelled',
	DONOR_REGISTERED_CAMP: 'donor_registered_camp',

	// Emergency Activities
	EMERGENCY_CREATED: 'emergency_created',
	EMERGENCY_FULFILLED: 'emergency_fulfilled',

	// System Activities
	NOTIFICATION_SENT: 'notification_sent',
	REPORT_GENERATED: 'report_generated',
};

const activitySchema = new mongoose.Schema(
	{
		activityId: {
			type: String,
			unique: true,
			default: () => `ACT${Date.now()}`,
		},

		type: {
			type: String,
			enum: Object.values(ACTIVITY_TYPES),
			required: true,
			index: true,
		},

		performedBy: {
			userId: {
				type: mongoose.Schema.Types.ObjectId,
				refPath: 'performedBy.userModel',
				required: true,
			},
			userModel: {
				type: String,
				required: true,
				enum: ['User', 'Hospital', 'NGO', 'Admin'],
			},
			userRole: String,
		},

		details: {
			action: String,
			description: String,
			previousState: mongoose.Schema.Types.Mixed,
			newState: mongoose.Schema.Types.Mixed,
			metadata: mongoose.Schema.Types.Mixed,
		},

		target: {
			modelType: {
				type: String,
				enum: [
					'User',
					'Hospital',
					'NGO',
					'BloodRequest',
					'PlasmaRequest',
					'DonationCamp',
					'Appointment',
				],
			},
			modelId: mongoose.Schema.Types.ObjectId,
			description: String,
		},

		status: {
			type: String,
			enum: ['success', 'failure', 'pending'],
			default: 'success',
		},

		location: {
			type: {
				type: String,
				enum: ['Point'],
				default: 'Point',
			},
			coordinates: {
				type: [Number],
				validate: {
					validator: function (coords) {
						return (
							coords.length === 2 &&
							coords[0] >= -180 &&
							coords[0] <= 180 &&
							coords[1] >= -90 &&
							coords[1] <= 90
						);
					},
					message: 'Invalid coordinates',
				},
			},
		},

		ipAddress: String,
		userAgent: String,

		errorDetails: {
			code: String,
			message: String,
			stack: String,
		},
	},
	{
		timestamps: true,
	},
);

// Indexes for common queries
activitySchema.index({ createdAt: -1 });
activitySchema.index({ 'performedBy.userId': 1, createdAt: -1 });
activitySchema.index({ type: 1, createdAt: -1 });
activitySchema.index({ 'target.modelType': 1, 'target.modelId': 1 });
activitySchema.index({ location: '2dsphere' });

// Static methods
activitySchema.statics = {
	async logActivity({ type, performedBy, details, target, location, status }) {
		return this.create({
			type,
			performedBy,
			details,
			target,
			location,
			status,
			ipAddress: details?.ipAddress,
			userAgent: details?.userAgent,
		});
	},

	async getUserActivities(userId, startDate, endDate) {
		return this.find({
			'performedBy.userId': userId,
			createdAt: {
				$gte: startDate || new Date(0),
				$lte: endDate || new Date(),
			},
		}).sort({ createdAt: -1 });
	},

	async getActivityStats(type, startDate, endDate) {
		return this.aggregate([
			{
				$match: {
					type,
					createdAt: {
						$gte: startDate || new Date(0),
						$lte: endDate || new Date(),
					},
				},
			},
			{
				$group: {
					_id: {
						$dateToString: {
							format: '%Y-%m-%d',
							date: '$createdAt',
						},
					},
					count: { $sum: 1 },
				},
			},
			{ $sort: { _id: 1 } },
		]);
	},
};

const Activity = mongoose.model('Activity', activitySchema);
export { Activity, ACTIVITY_TYPES };
