import mongoose from 'mongoose';
import { ApiError } from '../../utils/ApiError.js';

const ORGAN_TYPES = ['Kidney', 'Liver', 'Heart', 'Lungs', 'Pancreas', 'Corneas'];

const STATUS_TYPES = {
	REGISTERED: 'Registered',
	MATCHING: 'Matching',
	MATCHED: 'Matched',
	SCHEDULED: 'Scheduled',
	COMPLETED: 'Completed',
	CANCELLED: 'Cancelled',
};

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const organRequestSchema = new mongoose.Schema(
	{
		requestId: {
			type: String,
			unique: true,
			required: true,
			default: () => `OR${Date.now()}`,
		},

		hospitalId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Hospital',
			required: true,
			index: true,
		},

		organType: {
			type: String,
			enum: ORGAN_TYPES,
			required: true,
		},

		bloodGroup: {
			type: String,
			enum: BLOOD_TYPES,
			required: true,
		},

		patientInfo: {
			name: { type: String },
			age: { type: Number },
			gender: {
				type: String,
				enum: ['Male', 'Female', 'Other'],
			},
			weight: { type: Number },
			height: { type: Number },
			medicalHistory: [String],
			diagnosisDetails: String,
			urgencyScore: {
				type: Number,
				min: 1,
				max: 100,
			},
			confidential: {
				type: Boolean,
				default: true,
			},
		},

		status: {
			type: String,
			enum: Object.values(STATUS_TYPES),
			default: STATUS_TYPES.REGISTERED,
		},

		medicalTeam: [
			{
				doctorId: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'User',
				},
				role: String,
				department: String,
			},
		],

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

		documents: [
			{
				name: String,
				fileUrl: String,
				fileType: {
					type: String,
					enum: ['medical_report', 'consent_form', 'test_results', 'other'],
				},
				uploadedBy: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'User',
				},
				uploadedAt: {
					type: Date,
					default: Date.now,
				},
			},
		],

		matchingCriteria: {
			tissueType: String,
			organSize: String,
			additionalFactors: [String],
		},
	},
	{
		timestamps: true,
	},
);

// Indexes
organRequestSchema.index({ status: 1, 'patientInfo.urgencyScore': -1 });
organRequestSchema.index({ organType: 1, bloodGroup: 1, status: 1 });

// Methods
organRequestSchema.methods.updateStatus = async function (newStatus, userId, notes) {
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

const OrganRequest = mongoose.model('OrganRequest', organRequestSchema);

export { OrganRequest, ORGAN_TYPES, STATUS_TYPES, BLOOD_TYPES };
