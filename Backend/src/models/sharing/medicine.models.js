import mongoose from 'mongoose';
import { ApiError } from '../../utils/ApiError.js';

const MEDICINE_CATEGORIES = {
	TABLET: 'Tablet',
	CAPSULE: 'Capsule',
	SYRUP: 'Syrup',
	INJECTION: 'Injection',
	INHALER: 'Inhaler',
	OINTMENT: 'Ointment',
	DROPS: 'Drops',
};

const VERIFICATION_STATUS = {
	PENDING: 'Pending',
	VERIFIED: 'Verified',
	REJECTED: 'Rejected',
	EXPIRED: 'Expired',
};

const medicineSchema = new mongoose.Schema(
	{
		listingId: {
			type: String,
			unique: true,
			default: () => `MED${Date.now()}`,
		},

		name: {
			type: String,
			required: [true, 'Medicine name is required'],
			trim: true,
			index: true,
		},

		details: {
			category: {
				type: String,
				enum: Object.values(MEDICINE_CATEGORIES),
				required: true,
			},
			manufacturer: String,
			composition: [String],
			dosageForm: String,
			strength: String,
			batchNumber: String,
			prescriptionRequired: {
				type: Boolean,
				default: true,
			},
		},

		expiry: {
			manufacturingDate: Date,
			expiryDate: {
				type: Date,
				required: true,
				validate: {
					validator: function (date) {
						return date > new Date();
					},
					message: 'Expiry date must be in the future',
				},
			},
		},

		quantity: {
			available: {
				type: Number,
				required: true,
				min: [1, 'Quantity must be at least 1'],
			},
			unit: {
				type: String,
				required: true,
				enum: ['strips', 'bottles', 'units', 'vials', 'tubes'],
			},
			packageSize: Number,
		},

		donor: {
			userId: {
				type: mongoose.Schema.Types.ObjectId,
				refPath: 'donor.userType',
				required: true,
			},
			userType: {
				type: String,
				enum: ['User', 'Hospital', 'NGO'],
				required: true,
			},
			name: String,
			anonymous: {
				type: Boolean,
				default: false,
			},
		},

		verification: {
			status: {
				type: String,
				enum: Object.values(VERIFICATION_STATUS),
				default: VERIFICATION_STATUS.PENDING,
			},
			verifiedBy: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'NGO',
			},
			verificationDate: Date,
			remarks: String,
		},

		storage: {
			temperature: {
				min: Number,
				max: Number,
				unit: {
					type: String,
					enum: ['C', 'F'],
					default: 'C',
				},
			},
			conditions: [String],
			location: {
				type: {
					type: String,
					enum: ['Point'],
					default: 'Point',
				},
				coordinates: [Number],
				address: String,
			},
		},

		distribution: {
			isAvailable: {
				type: Boolean,
				default: true,
			},
			lastDistributionDate: Date,
			totalDistributed: {
				type: Number,
				default: 0,
			},
			recipients: [
				{
					recipientId: {
						type: mongoose.Schema.Types.ObjectId,
						refPath: 'distribution.recipients.recipientType',
					},
					recipientType: {
						type: String,
						enum: ['User', 'Hospital', 'NGO'],
					},
					quantity: Number,
					date: Date,
					verificationDocument: String,
				},
			],
		},
	},
	{
		timestamps: true,
	},
);

// Indexes
medicineSchema.index({ name: 'text' });
medicineSchema.index({ 'storage.location': '2dsphere' });
medicineSchema.index({ 'expiry.expiryDate': 1 });
medicineSchema.index({ 'verification.status': 1 });

// Methods
medicineSchema.methods = {
	async verifyListing(ngoId, status, remarks) {
		if (!Object.values(VERIFICATION_STATUS).includes(status)) {
			throw new ApiError(400, 'Invalid verification status');
		}

		this.verification = {
			status,
			verifiedBy: ngoId,
			verificationDate: new Date(),
			remarks,
		};

		return this.save();
	},

	async updateAvailability(quantity) {
		if (quantity > this.quantity.available) {
			throw new ApiError(400, 'Requested quantity exceeds available stock');
		}

		this.quantity.available -= quantity;
		this.isAvailable = this.quantity.available > 0;

		return this.save();
	},

	isExpired() {
		return new Date() > this.expiry.expiryDate;
	},
};

const Medicine = mongoose.model('Medicine', medicineSchema);
export { Medicine, MEDICINE_CATEGORIES, VERIFICATION_STATUS };
