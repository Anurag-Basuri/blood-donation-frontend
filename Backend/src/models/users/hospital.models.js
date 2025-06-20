import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ApiError } from '../../utils/ApiError.js';

// Constants
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const HOSPITAL_TYPES = [
	'General Hospital',
	'Multi-Specialty Hospital',
	'Blood Bank',
	'Trauma Center',
	'Maternity Hospital',
	"Children's Hospital",
	'Cancer Center',
	'Eye Hospital',
	'Dental Hospital',
	'Cardiac Hospital',
	'Orthopedic Hospital',
	'Psychiatric Hospital',
	'Clinic',
	'Primary Health Center',
	'Community Health Center',
	'Rehabilitation Center',
	'Teaching Hospital',
	'Government Hospital',
	'Private Hospital',
	'Charitable Hospital',
	'Telemedicine Center',
	'Other',
];

const URGENCY_LEVELS = ['Emergency', 'High', 'Regular', 'Future Need'];

// Rules: Required documents per specialty
const SPECIALTY_DOCUMENT_RULES = {
	'Blood Bank': ['bloodBankLicense', 'bioWaste', 'drugLicense'],
	'Trauma Center': ['ambulanceRegistration', 'fireSafety', 'accreditation'],
	'Multi-Specialty Hospital': ['registrationCertificate', 'tradeLicense', 'accreditation'],
	Clinic: ['registrationCertificate', 'identityProof'],
	'Telemedicine Center': ['registrationCertificate', 'panCard'],
	'General Hospital': ['registrationCertificate', 'gstCertificate'],
	'Teaching Hospital': ['registrationCertificate', 'accreditation'],
};

// Schema
const hospitalSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
			minlength: 3,
			maxlength: 100,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
			match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/, 'Invalid email'],
		},
		password: {
			type: String,
			required: true,
			minlength: 8,
			select: false,
			validate: {
				validator: v =>
					/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(v),
				message:
					'Password must include uppercase, lowercase, number, and special character',
			},
		},
		logo: {
			url: String,
			publicId: String,
			uploadedAt: {
				type: Date,
				default: Date.now,
			},
		},
		isVerified: {
			type: Boolean,
			default: false,
		},
		verificationOTP: {
			code: String,
			expiresAt: Date,
		},
		adminApproved: {
			type: Boolean,
			default: false,
		},
		refreshToken: {
			type: String,
			select: false,
		},
		lastLogin: Date,
		loginAttempts: {
			type: Number,
			default: 0,
		},
		lockedUntil: Date,

		contactPerson: {
			name: { type: String, required: true },
			phone: {
				type: String,
				required: true,
				validate: {
					validator: v => /^\+?[\d\s-]{10,}$/.test(v),
					message: 'Invalid phone number',
				},
			},
			position: String,
			alternatePhone: String,
			email: String,
		},

		emergencyContact: {
			name: {
				type: String,
				required: true,
			},
			phone: {
				type: String,
				required: true,
				validate: {
					validator: v => /^\+?[\d\s-]{10,}$/.test(v),
					message: 'Invalid emergency contact',
				},
			},
			available24x7: {
				type: Boolean,
				default: true,
			},
		},

		address: {
			street: { type: String, required: true },
			city: { type: String, required: true, index: true },
			state: { type: String, required: true },
			pinCode: {
				type: String,
				required: true,
				validate: {
					validator: v => /^\d{6}$/.test(v),
					message: 'Invalid PIN code',
				},
			},
			country: { type: String, default: 'India' },
			location: {
				type: { type: String, enum: ['Point'], default: 'Point' },
				coordinates: {
					type: [Number],
					required: true,
					validate: {
						validator: coords =>
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

		specialties: [
			{
				type: String,
				enum: HOSPITAL_TYPES,
			},
		],
		registrationNumber: {
			type: String,
			unique: true,
			sparse: true,
			validate: {
				validator: v => /^[A-Z0-9-]{5,}$/i.test(v),
				message: 'Invalid registration number format',
			},
		},

		documents: {
			registrationCertificate: {
				url: String,
				publicId: String,
				uploadedAt: Date,
			},
			tradeLicense: {
				url: String,
				publicId: String,
				uploadedAt: Date,
			},
			panCard: {
				url: String,
				publicId: String,
				uploadedAt: Date,
			},
			gstCertificate: {
				url: String,
				publicId: String,
				uploadedAt: Date,
			},
			fireSafety: {
				url: String,
				publicId: String,
				uploadedAt: Date,
			},
			bioWaste: {
				url: String,
				publicId: String,
				uploadedAt: Date,
			},
			drugLicense: {
				url: String,
				publicId: String,
				uploadedAt: Date,
			},
			bloodBankLicense: {
				url: String,
				publicId: String,
				uploadedAt: Date,
			},
			radiologyLicense: {
				url: String,
				publicId: String,
				uploadedAt: Date,
			},
			ambulanceRegistration: {
				url: String,
				publicId: String,
				uploadedAt: Date,
			},
			accreditation: {
				url: String,
				publicId: String,
				uploadedAt: Date,
			},
			identityProof: {
				url: String,
				publicId: String,
				uploadedAt: Date,
			},
		},

		bloodInventory: [
			{
				bloodGroup: {
					type: String,
					enum: BLOOD_GROUPS,
				},
				available: {
					type: Number,
					default: 0,
					min: 0,
				},
				reserved: {
					type: Number,
					default: 0,
					min: 0,
				},
				lastUpdated: {
					type: Date,
					default: Date.now,
				},
			},
		],

		statistics: {
			totalRequestsMade: {
				type: Number,
				default: 0,
			},
			successfulRequests: {
				type: Number,
				default: 0,
			},
			emergencyRequests: {
				type: Number,
				default: 0,
			},
			lastRequestDate: {
				type: Date,
			},
		},

		settings: {
			autoApproveRequests: {
				type: Boolean,
				default: false,
			},
			preferredBloodGroups: [{ type: String, enum: BLOOD_GROUPS }],
			notificationEnabled: {
				type: Boolean,
				default: true,
			},
			responseRadius: {
				type: Number,
				default: 50,
			},
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	},
);

// Indexes
hospitalSchema.index({ 'address.city': 1, 'address.pinCode': 1 });
hospitalSchema.index({ 'address.location': '2dsphere' });

// Virtuals
hospitalSchema.virtual('pendingRequests', {
	ref: 'BloodRequest',
	localField: '_id',
	foreignField: 'hospitalId',
	match: { status: { $in: ['Pending', 'Processing'] } },
});

// Methods
hospitalSchema.methods = {
	async comparePassword(candidatePassword) {
		return await bcrypt.compare(candidatePassword, this.password);
	},

	async findNearbyNGOs(maxDistance = 10000) {
		return mongoose.model('NGO').find({
			'address.location': {
				$near: {
					$geometry: this.address.location,
					$maxDistance: maxDistance,
				},
			},
			isVerified: true,
		});
	},

	async updateBloodInventory(bloodGroup, change) {
		const inventory = this.bloodInventory.find(i => i.bloodGroup === bloodGroup);
		if (!inventory) {
			this.bloodInventory.push({
				bloodGroup,
				available: Math.max(0, change),
				lastUpdated: new Date(),
			});
		} else {
			inventory.available = Math.max(0, inventory.available + change);
			inventory.lastUpdated = new Date();
		}
		return this.save();
	},
};

// Middleware: Password hashing
hospitalSchema.pre('save', async function (next) {
	if (!this.isModified('password')) return next();
	this.password = await bcrypt.hash(this.password, 12);
	next();
});

// Middleware: Validate required documents by specialty
hospitalSchema.pre('save', function (next) {
	if (!this.isModified('specialties') && !this.isModified('documents')) return next();

	const missingDocs = new Set();

	this.specialties?.forEach(type => {
		const requiredDocs = SPECIALTY_DOCUMENT_RULES[type] || [];
		requiredDocs.forEach(docKey => {
			const doc = this.documents?.[docKey];
			if (!doc || !doc.url || !doc.publicId) {
				missingDocs.add(docKey);
			}
		});
	});

	if (missingDocs.size > 0) {
		return next(
			new ApiError(400, `Missing required documents: ${[...missingDocs].join(', ')}`),
		);
	}

	next();
});

export const Hospital = mongoose.model('Hospital', hospitalSchema);
