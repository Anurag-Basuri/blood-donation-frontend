import mongoose from 'mongoose';

const NOTIFICATION_TYPES = {
	URGENT_BLOOD_REQUEST: 'urgent-blood-request',
	DONATION_REMINDER: 'donation-reminder',
	APPOINTMENT_CONFIRMATION: 'appointment-confirmation',
	BLOOD_AVAILABILITY: 'blood-availability',
	GENERAL: 'general',
};

const DELIVERY_STATUS = {
	PENDING: 'pending',
	SENT: 'sent',
	FAILED: 'failed',
};

const NOTIFICATION_STATUS = {
	PENDING: 'pending',
	SENT: 'sent',
	FAILED: 'failed',
	READ: 'read',
};

const deliveryAttemptSchema = new mongoose.Schema(
	{
		status: {
			type: String,
			enum: Object.values(DELIVERY_STATUS),
			default: DELIVERY_STATUS.PENDING,
		},
		attempts: {
			type: Number,
			default: 0,
		},
		lastAttempt: Date,
		error: String,
	},
	{ _id: false },
);

const notificationSchema = new mongoose.Schema(
	{
		notificationId: {
			type: String,
			unique: true,
			default: () => `NOTIF${Date.now()}`,
		},

		type: {
			type: String,
			enum: Object.values(NOTIFICATION_TYPES),
			required: true,
			index: true,
		},

		recipient: {
			type: mongoose.Schema.Types.ObjectId,
			refPath: 'recipientModel',
			required: true,
			index: true,
		},

		recipientModel: {
			type: String,
			required: true,
			enum: ['User', 'Hospital', 'NGO'],
			default: 'User',
		},

		data: {
			bloodType: String,
			hospital: String,
			center: String,
			date: Date,
			nextDonationDate: Date,
			message: String,
			sendSMS: {
				type: Boolean,
				default: true,
			},
			metadata: mongoose.Schema.Types.Mixed,
		},

		status: {
			type: String,
			enum: Object.values(NOTIFICATION_STATUS),
			default: NOTIFICATION_STATUS.PENDING,
			index: true,
		},

		deliveryAttempts: {
			email: deliveryAttemptSchema,
			sms: deliveryAttemptSchema,
		},

		readAt: Date,
		sentAt: Date,

		expiresAt: {
			type: Date,
			default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days TTL
		},
	},
	{ timestamps: true },
);

// TTL index
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Helpful indexes
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ recipient: 1, status: 1, type: 1 });

// ──────────────── Instance Methods ────────────────
notificationSchema.methods.markAsRead = async function () {
	this.status = NOTIFICATION_STATUS.READ;
	this.readAt = new Date();
	return await this.save();
};

notificationSchema.methods.updateDeliveryStatus = async function (channel, success, error = null) {
	if (!['email', 'sms'].includes(channel)) return;

	const attempt = this.deliveryAttempts[channel];
	attempt.attempts += 1;
	attempt.lastAttempt = new Date();
	attempt.status = success ? DELIVERY_STATUS.SENT : DELIVERY_STATUS.FAILED;
	if (!success && error) {
		attempt.error = error;
	}
	return await this.save();
};

// ──────────────── Static Methods ────────────────
notificationSchema.statics.getUnreadForRecipient = async function (recipientId) {
	return this.find({
		recipient: recipientId,
		status: { $ne: NOTIFICATION_STATUS.READ },
	}).sort({ createdAt: -1 });
};

notificationSchema.statics.markAllAsReadForRecipient = async function (recipientId) {
	return this.updateMany(
		{
			recipient: recipientId,
			status: { $ne: NOTIFICATION_STATUS.READ },
		},
		{
			$set: {
				status: NOTIFICATION_STATUS.READ,
				readAt: new Date(),
			},
		},
	);
};

const Notification = mongoose.model('Notification', notificationSchema);

export { Notification, NOTIFICATION_TYPES, NOTIFICATION_STATUS, DELIVERY_STATUS };
