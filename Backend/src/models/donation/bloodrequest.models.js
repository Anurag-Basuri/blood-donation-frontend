import mongoose from 'mongoose';
import { ApiError } from '../../utils/ApiError.js';

// Enums
const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const URGENCY_LEVELS = {
	EMERGENCY: 'Emergency',
	URGENT: 'Urgent',
	STANDARD: 'Standard',
	PLANNED: 'Planned',
};
const STATUS_TYPES = {
	PENDING: 'Pending',
	ACCEPTED: 'Accepted',
	PROCESSING: 'Processing',
	ASSIGNED: 'Assigned',
	EN_ROUTE: 'En Route',
	DELIVERED: 'Delivered',
	COMPLETED: 'Completed',
	CANCELLED: 'Cancelled',
	REJECTED: 'Rejected',
};

const bloodRequestSchema = new mongoose.Schema(
	{
		requestId: {
			type: String,
			unique: true,
			default: () => `BR${Date.now()}`,
		},

		hospitalId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Hospital',
			required: true,
			index: true,
		},

		ngoId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'NGO',
			required: true,
			index: true,
		},

		bloodGroups: [
			{
				bloodGroup: {
					type: String,
					enum: BLOOD_TYPES,
					required: true,
				},
				units: {
					type: Number,
					required: true,
					min: 1,
					max: 50,
				},
				fulfilledUnits: {
					type: Number,
					default: 0,
				},
				assignedDonations: [
					{
						donationId: {
							type: mongoose.Schema.Types.ObjectId,
							ref: 'BloodDonation',
						},
						assignedAt: {
							type: Date,
							default: Date.now,
						},
					},
				],
			},
		],

		urgencyLevel: {
			type: String,
			enum: Object.values(URGENCY_LEVELS),
			default: URGENCY_LEVELS.STANDARD,
			required: true,
		},

		requiredBy: {
			type: Date,
			required: true,
			validate: {
				validator: (date) => date > new Date(),
				message: 'Required date must be in the future',
			},
		},

		patientInfo: {
			name: String,
			age: Number,
			gender: {
				type: String,
				enum: ['Male', 'Female', 'Other'],
			},
			condition: String,
			wardNumber: String,
			confidential: {
				type: Boolean,
				default: false,
			},
		},

		status: {
			type: String,
			enum: Object.values(STATUS_TYPES),
			default: STATUS_TYPES.PENDING,
		},

		statusHistory: [
			{
				status: {
					type: String,
					enum: Object.values(STATUS_TYPES),
				},
				updatedBy: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'User',
					required: true,
				},
				updatedAt: {
					type: Date,
					default: Date.now,
				},
				notes: String,
			},
		],

		requestNotes: String,
		internalNotes: String,

		deliveryDetails: {
			estimatedDeliveryTime: Date,
			actualDeliveryTime: Date,
			deliveredBy: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User',
			},
			receivedBy: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User',
			},
			confirmationCode: {
				type: String,
				unique: true,
				sparse: true,
			},
			deliveryNotes: String,
			coordinates: {
				type: {
					type: String,
					enum: ['Point'],
					default: 'Point',
				},
				coordinates: {
					type: [Number],
					validate: {
						validator: (coords) =>
							coords.length === 2 &&
							coords[0] >= -180 &&
							coords[0] <= 180 &&
							coords[1] >= -90 &&
							coords[1] <= 90,
						message: 'Invalid coordinates',
					},
				},
			},
		},

		priority: {
			type: Number,
			min: 1,
			max: 3,
			default: 3,
		},
	},
	{ timestamps: true }
);

// Indexes
bloodRequestSchema.index({ status: 1, urgencyLevel: 1 });
bloodRequestSchema.index({ hospitalId: 1, status: 1 });
bloodRequestSchema.index({ 'deliveryDetails.coordinates': '2dsphere' });

// Methods
bloodRequestSchema.methods = {
	async updateStatus(newStatus, userId, notes) {
		if (!Object.values(STATUS_TYPES).includes(newStatus)) {
			throw new ApiError(400, 'Invalid status');
		}
		this.status = newStatus;
		this.statusHistory.push({
			status: newStatus,
			updatedBy: userId,
			notes,
		});
		return this.save();
	},

	isUrgent() {
		return (
			this.urgencyLevel === URGENCY_LEVELS.EMERGENCY ||
			this.urgencyLevel === URGENCY_LEVELS.URGENT
		);
	},

	calculateFulfillmentStatus() {
		const totalRequested = this.bloodGroups.reduce((sum, bg) => sum + bg.units, 0);
		const totalFulfilled = this.bloodGroups.reduce((sum, bg) => sum + bg.fulfilledUnits, 0);
		return {
			totalRequested,
			totalFulfilled,
			percentageFulfilled: ((totalFulfilled / totalRequested) * 100).toFixed(2),
		};
	},
};

// Statics
bloodRequestSchema.statics = {
	async findUrgentRequests() {
		return this.find({
			urgencyLevel: { $in: [URGENCY_LEVELS.EMERGENCY, URGENCY_LEVELS.URGENT] },
			status: { $nin: [STATUS_TYPES.COMPLETED, STATUS_TYPES.CANCELLED] },
		}).sort({ priority: -1, createdAt: 1 });
	},

	async findPendingByBloodGroup(bloodGroup) {
		return this.find({
			'bloodGroups.bloodGroup': bloodGroup,
			status: STATUS_TYPES.PENDING,
		});
	},
};

const BloodRequest =
	mongoose.models.BloodRequest || mongoose.model('BloodRequest', bloodRequestSchema);
export {
	BloodRequest,
	BLOOD_TYPES,
	URGENCY_LEVELS,
	STATUS_TYPES
};
