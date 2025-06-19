import mongoose from 'mongoose';

const NOTIFICATION_TYPES = {
	URGENT_BLOOD_REQUEST: 'urgent-blood-request',
	DONATION_REMINDER: 'donation-reminder',
	APPOINTMENT_CONFIRMATION: 'appointment-confirmation',
	BLOOD_AVAILABILITY: 'blood-availability',
};

const NOTIFICATION_STATUS = {
	PENDING: 'pending',
	SENT: 'sent',
	FAILED: 'failed',
	READ: 'read',
};

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
			email: {
				status: {
					type: String,
					enum: ['pending', 'sent', 'failed'],
					default: 'pending',
				},
				attempts: {
					type: Number,
					default: 0,
				},
				lastAttempt: Date,
				error: String,
			},
			sms: {
				status: {
					type: String,
					enum: ['pending', 'sent', 'failed'],
					default: 'pending',
				},
				attempts: {
					type: Number,
					default: 0,
				},
				lastAttempt: Date,
				error: String,
			},
		},

		readAt: Date,
		sentAt: Date,
		expiresAt: {
			type: Date,
			default: () => new Date(+new Date() + 30 * 24 * 60 * 60 * 1000), // 30 days from creation
		},
	},
	{
		timestamps: true,
	},
);

// Indexes for common queries
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ status: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, status: 1, type: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Instance methods
notificationSchema.methods = {
	async markAsRead() {
		this.status = NOTIFICATION_STATUS.READ;
		this.readAt = new Date();
		return this.save();
	},

	async updateDeliveryStatus(channel, success, error = null) {
		this.deliveryAttempts[channel].attempts += 1;
		this.deliveryAttempts[channel].lastAttempt = new Date();

		if (success) {
			this.deliveryAttempts[channel].status = 'sent';
		} else {
			this.deliveryAttempts[channel].status = 'failed';
			this.deliveryAttempts[channel].error = error;
		}

		return this.save();
	},
};

// Static methods
notificationSchema.statics = {
	async getUnreadNotifications(recipientId) {
		return this.find({
			recipient: recipientId,
			status: { $ne: NOTIFICATION_STATUS.READ },
		}).sort({ createdAt: -1 });
	},

	async markAllAsRead(recipientId) {
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
	},
};

const Notification = mongoose.model('Notification', notificationSchema);

export { Notification, NOTIFICATION_TYPES, NOTIFICATION_STATUS };
