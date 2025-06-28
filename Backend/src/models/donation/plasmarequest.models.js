import mongoose from 'mongoose';
import { ApiError } from '../../utils/ApiError.js';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const STATUS_TYPES = {
	PENDING: 'Pending',
	ACCEPTED: 'Accepted',
	PROCESSING: 'Processing',
	COMPLETED: 'Completed',
	CANCELLED: 'Cancelled',
};
const URGENCY_LEVELS = ['Critical', 'High', 'Medium', 'Low'];
const COVID_STATUS = ['Positive', 'Negative', 'Recovered', 'Unknown'];
const ANTIBODY_TITERS = ['High', 'Medium', 'Low', 'Unknown'];

const plasmaRequestSchema = new mongoose.Schema(
	{
		requestId: {
			type: String,
			unique: true,
			required: true,
			default: () => `PR${Date.now()}`,
		},

		hospitalId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Hospital',
			required: true,
			index: true,
		},

		bloodGroup: {
			type: String,
			enum: BLOOD_TYPES,
			required: true,
		},

		units: {
			type: Number,
			required: true,
			min: 1,
			max: 10,
		},

		covidRecovered: {
			type: Boolean,
			default: false,
		},

		antibodyTiter: {
			type: String,
			enum: ANTIBODY_TITERS,
			default: 'Unknown',
		},

		patientInfo: {
			name: String,
			age: Number,
			gender: {
				type: String,
				enum: ['Male', 'Female', 'Other'],
			},
			covidStatus: {
				type: String,
				enum: COVID_STATUS,
			},
			condition: String,
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

		urgency: {
			type: String,
			enum: URGENCY_LEVELS,
			required: true,
		},

		requiredBy: {
			type: Date,
			required: true,
			validate: {
				validator: value => value > new Date(),
				message: 'Required date must be in the future',
			},
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
				},
				updatedAt: {
					type: Date,
					default: Date.now,
				},
				notes: String,
			},
		],
	},
	{
		timestamps: true,
	},
);

// Indexes
plasmaRequestSchema.index({ status: 1, urgency: 1 });
plasmaRequestSchema.index({ bloodGroup: 1, status: 1 });

// Methods
plasmaRequestSchema.methods.updateStatus = async function (newStatus, userId, notes) {
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
};

const PlasmaRequest =
	mongoose.models.PlasmaRequest || mongoose.model('PlasmaRequest', plasmaRequestSchema);

export { PlasmaRequest, BLOOD_TYPES, STATUS_TYPES, URGENCY_LEVELS };
