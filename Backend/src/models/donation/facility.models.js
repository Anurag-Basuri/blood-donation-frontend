import mongoose from 'mongoose';
import { BLOOD_TYPES } from "./blood.models.js";
import { ApiError } from "../../utils/ApiError.js";

const FACILITY_TYPE = {
    CENTER: "CENTER",
    CAMP: "CAMP"
};

const FACILITY_STATUS = {
    PLANNED: "Planned",     // For camps before start date
    ACTIVE: "Active",       // Operating normally
    INACTIVE: "Inactive",   // Temporarily closed
    COMPLETED: "Completed", // For finished camps
    SUSPENDED: "Suspended", // For centers under review
    CANCELLED: "Cancelled"  // For cancelled camps
};

const facilitySchema = new mongoose.Schema(
    {
        facilityType: {
            type: String,
            enum: Object.values(FACILITY_TYPE),
            required: true
        },
        name: {
            type: String,
            required: [true, "Facility name is required"],
            trim: true,
            minlength: [3, "Name must be at least 3 characters"]
        },
        ngoId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "NGO",
            required: true
        },
        contactInfo: {
            person: {
                name: String,
                phone: String,
                email: String
            },
            address: {
                street: String,
                city: { type: String, required: true },
                state: String,
                pinCode: {
                    type: String,
                    required: true,
                    validate: {
                        validator: (v) => /^\d{6}$/.test(v),
                        message: "Invalid PIN code"
                    }
                }
            },
            location: {
                type: { type: String, enum: ["Point"], default: "Point" },
                coordinates: [Number]
            }
        },
        schedule: {
            // For permanent centers
            operatingHours: [{
                day: {
                    type: String,
                    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
                },
                open: String,
                close: String
            }],
            // For temporary camps
            startDate: Date,
            endDate: Date,
            slots: [{
                date: Date,
                startTime: String,
                endTime: String,
                capacity: { type: Number, default: 50 },
                booked: { type: Number, default: 0 }
            }]
        },
        bloodInventory: [{
            bloodGroup: { type: String, enum: BLOOD_TYPES },
            available: { type: Number, default: 0 },
            reserved: { type: Number, default: 0 },
            lastUpdated: Date
        }],
        facilities: [{
            type: String,
            enum: ["Blood Testing", "Blood Storage", "Transport", "Emergency Response"]
        }],
        status: {
            type: String,
            enum: Object.values(FACILITY_STATUS),
            default: FACILITY_STATUS.ACTIVE
        },
        registration: {
            isOpen: { type: Boolean, default: true },
            registeredDonors: [{
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User"
                },
                slotId: mongoose.Schema.Types.ObjectId,
                status: {
                    type: String,
                    enum: ["Registered", "Confirmed", "Cancelled", "Completed"],
                    default: "Registered"
                },
                registeredAt: { type: Date, default: Date.now }
            }]
        },
        statistics: {
            totalRegistrations: { type: Number, default: 0 },
            actualDonors: { type: Number, default: 0 },
            bloodCollected: { type: Number, default: 0 }
        },
        license: {
            number: String,
            validUntil: Date,
            issuedBy: String
        }
    },
    {
        timestamps: true,
        discriminatorKey: 'facilityType'
    }
);

// Essential indexes
facilitySchema.index({ "contactInfo.location": "2dsphere" });
facilitySchema.index({ "contactInfo.address.city": 1 });
facilitySchema.index({ ngoId: 1, status: 1 });
facilitySchema.index({ "schedule.startDate": 1, status: 1 });

// Shared methods
facilitySchema.methods = {
    async updateInventory(bloodGroup, change) {
        const inventory = this.bloodInventory.find(i => i.bloodGroup === bloodGroup);
        if (!inventory) {
            this.bloodInventory.push({
                bloodGroup,
                available: Math.max(0, change),
                lastUpdated: new Date()
            });
        } else {
            inventory.available = Math.max(0, inventory.available + change);
            inventory.lastUpdated = new Date();
        }
        return this.save();
    },

    async updateStatus(newStatus) {
        if (!FACILITY_STATUS[newStatus]) {
            throw new ApiError(400, "Invalid status");
        }
        this.status = newStatus;
        return this.save();
    },

    async registerDonor(userId, slotId) {
        if (!this.registration.isOpen) {
            throw new ApiError(400, "Registration closed");
        }

        const slot = this.schedule.slots?.id(slotId);
        if (!slot || slot.booked >= slot.capacity) {
            throw new ApiError(400, "Slot unavailable");
        }

        slot.booked += 1;
        this.registration.registeredDonors.push({
            userId,
            slotId,
            status: "Registered"
        });
        this.statistics.totalRegistrations += 1;

        return this.save();
    }
};

// Static methods
facilitySchema.statics = {
    async findNearby(coordinates, radius = 10000, type = null) {
        const query = {
            status: { $in: [FACILITY_STATUS.ACTIVE, FACILITY_STATUS.PLANNED] },
            "contactInfo.location": {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates
                    },
                    $maxDistance: radius
                }
            }
        };

        if (type) {
            query.facilityType = type;
        }

        return this.find(query).select("name contactInfo schedule status");
    }
};

const Facility = mongoose.model('Facility', facilitySchema);

// Create specific models using discriminator
const DonationCenter = Facility.discriminator(
    FACILITY_TYPE.CENTER,
    new mongoose.Schema({})
);

const DonationCamp = Facility.discriminator(
    FACILITY_TYPE.CAMP,
    new mongoose.Schema({
        campId: {
            type: String,
            unique: true,
            default: () => `CAMP${Date.now()}`
        }
    })
);

export {
    Facility,
    DonationCenter,
    DonationCamp,
    FACILITY_TYPE,
    FACILITY_STATUS
};