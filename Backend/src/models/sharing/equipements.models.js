import mongoose from 'mongoose';
import { ApiError } from '../../utils/ApiError.js';

// ENUMS
const EQUIPMENT_TYPES = {
	OXYGEN: 'Oxygen Cylinder',
	WHEELCHAIR: 'Wheelchair',
	HOSPITAL_BED: 'Hospital Bed',
	VENTILATOR: 'Ventilator',
	BP_MONITOR: 'BP Monitor',
	NEBULIZER: 'Nebulizer',
	GLUCOMETER: 'Glucometer',
	CRUTCHES: 'Crutches',
	WALKER: 'Walker',
};

const EQUIPMENT_STATUS = {
	AVAILABLE: 'Available',
	IN_USE: 'In Use',
	UNDER_MAINTENANCE: 'Under Maintenance',
	RESERVED: 'Reserved',
	RETIRED: 'Retired',
};

// SCHEMA
const equipmentSchema = new mongoose.Schema(
	{
		equipmentId: {
			type: String,
			unique: true,
			required: true,
			default: () => `EQ${Date.now()}`,
		},

		type: {
			type: String,
			enum: Object.values(EQUIPMENT_TYPES),
			required: true,
		},

		owner: {
			entityId: {
				type: mongoose.Schema.Types.ObjectId,
				refPath: 'owner.entityType',
				required: true,
			},
			entityType: {
				type: String,
				enum: ['Hospital', 'NGO', 'User'],
				required: true,
			},
			name: String,
		},

		details: {
			manufacturer: String,
			model: String,
			serialNumber: String,
			purchaseDate: Date,
			condition: {
				type: String,
				enum: ['New', 'Good', 'Fair', 'Poor'],
				default: 'Good',
			},
			specifications: mongoose.Schema.Types.Mixed,
		},

		images: [
			{
				url: {
					type: String,
					required: true,
					validate: {
						validator: v => /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/.test(v),
						message: 'Invalid image URL',
					},
				},
				caption: String,
			},
		],

		status: {
			current: {
				type: String,
				enum: Object.values(EQUIPMENT_STATUS),
				default: EQUIPMENT_STATUS.AVAILABLE,
			},
			lastUpdated: {
				type: Date,
				default: Date.now,
			},
			notes: String,
		},

		location: {
			type: {
				type: String,
				enum: ['Point'],
				default: 'Point',
			},
			coordinates: {
				type: [Number],
				required: true,
				validate: {
					validator: coords =>
						Array.isArray(coords) &&
						coords.length === 2 &&
						coords[0] >= -180 &&
						coords[0] <= 180 &&
						coords[1] >= -90 &&
						coords[1] <= 90,
					message: 'Invalid coordinates',
				},
			},
			address: String,
		},

		availability: {
			isAvailable: {
				type: Boolean,
				default: true,
			},
			nextAvailableDate: Date,
			rentalTerms: {
				dailyRate: Number,
				deposit: Number,
				minDuration: Number,
				maxDuration: Number,
			},
		},

		currentBooking: {
			borrowerId: {
				type: mongoose.Schema.Types.ObjectId,
				refPath: 'currentBooking.borrowerType',
			},
			borrowerType: {
				type: String,
				enum: ['User', 'Hospital', 'NGO'],
			},
			startDate: Date,
			endDate: Date,
			purpose: String,
		},

		maintenanceHistory: [
			{
				date: Date,
				type: {
					type: String,
					enum: ['Routine', 'Repair', 'Inspection'],
				},
				description: String,
				cost: Number,
				performedBy: String,
				nextDueDate: Date,
			},
		],

		usageHistory: [
			{
				borrowerId: {
					type: mongoose.Schema.Types.ObjectId,
					refPath: 'usageHistory.borrowerType',
				},
				borrowerType: {
					type: String,
					enum: ['User', 'Hospital', 'NGO'],
				},
				startDate: Date,
				endDate: Date,
				purpose: String,
				condition: {
					before: String,
					after: String,
				},
				notes: String,
			},
		],
	},
	{
		timestamps: true,
	},
);

// INDEXES
equipmentSchema.index({ location: '2dsphere' });
equipmentSchema.index({ type: 1, 'status.current': 1 });
equipmentSchema.index({ 'owner.entityId': 1, 'owner.entityType': 1 });

// METHODS
equipmentSchema.methods = {
	async updateStatus(newStatus, notes = '') {
		if (!Object.values(EQUIPMENT_STATUS).includes(newStatus)) {
			throw new ApiError(400, 'Invalid equipment status');
		}
		this.status.current = newStatus;
		this.status.lastUpdated = new Date();
		this.status.notes = notes;
		return this.save();
	},

	async createBooking(borrowerId, borrowerType, startDate, endDate, purpose = '') {
		if (this.currentBooking) {
			throw new ApiError(400, 'Equipment already booked');
		}
		this.currentBooking = { borrowerId, borrowerType, startDate, endDate, purpose };
		this.status.current = EQUIPMENT_STATUS.RESERVED;
		return this.save();
	},

	async endBooking() {
		if (!this.currentBooking) {
			throw new ApiError(400, 'No active booking to end');
		}
		this.usageHistory.push({ ...this.currentBooking });
		this.currentBooking = undefined;
		this.status.current = EQUIPMENT_STATUS.AVAILABLE;
		this.status.lastUpdated = new Date();
		return this.save();
	},
};

const Equipment = mongoose.model('Equipment', equipmentSchema);

export { Equipment, EQUIPMENT_TYPES, EQUIPMENT_STATUS };
