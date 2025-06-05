import mongoose from 'mongoose';
import { ApiError } from "../utils/ApiError.js";

const CAMP_STATUS = {
    PLANNED: "Planned",
    ACTIVE: "Active",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
};

const CAMP_TYPES = {
    GENERAL: "General",
    CORPORATE: "Corporate",
    EDUCATIONAL: "Educational",
    COMMUNITY: "Community",
};

const campSchema = new mongoose.Schema(
    {
        campId: {
            type: String,
            unique: true,
            default: () => `CAMP${Date.now()}`,
        },
        name: {
            type: String,
            required: [true, "Camp name is required"],
            trim: true,
            minlength: [3, "Name must be at least 3 characters"],
        },
        organizedBy: {
            ngoId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "NGO",
                required: true,
            },
        },
        schedule: {
            startDate: {
                type: Date,
                required: true,
                validate: {
                    validator: (date) => date > new Date(),
                    message: "Start date must be in the future",
                },
            },
            endDate: {
                type: Date,
                required: true,
                validate: {
                    validator: function (date) {
                        return date >= this.schedule.startDate;
                    },
                    message: "End date must be after start date",
                },
            },
            slots: [
                {
                    date: Date,
                    startTime: String,
                    endTime: String,
                    capacity: { type: Number, default: 50 },
                    booked: { type: Number, default: 0 },
                },
            ],
        },
        venue: {
            name: { type: String, required: true },
            address: {
                street: String,
                city: { type: String, required: true, index: true },
                state: String,
                pinCode: {
                    type: String,
                    required: true,
                    validate: {
                        validator: (v) => /^\d{6}$/.test(v),
                        message: "Invalid PIN code",
                    },
                },
            },
            location: {
                type: { type: String, enum: ["Point"], default: "Point" },
                coordinates: [Number],
            },
        },
        registration: {
            isOpen: { type: Boolean, default: true },
            registeredDonors: [
                {
                    userId: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User",
                    },
                    slotId: { type: mongoose.Schema.Types.ObjectId },
                    status: {
                        type: String,
                        enum: [
                            "Registered",
                            "Confirmed",
                            "Cancelled",
                            "Completed",
                        ],
                        default: "Registered",
                    },
                    registeredAt: { type: Date, default: Date.now },
                },
            ],
        },
        status: {
            type: String,
            enum: Object.values(CAMP_STATUS),
            default: CAMP_STATUS.PLANNED,
        },
        statistics: {
            totalRegistrations: { type: Number, default: 0 },
            actualDonors: { type: Number, default: 0 },
            bloodCollected: { type: Number, default: 0 },
        },
        emergencyContact: {
            name: String,
            phone: String,
            email: String,
        },
    },
    {
        timestamps: true,
    }
);

// Essential indexes
campSchema.index({ "venue.location": "2dsphere" });
campSchema.index({ "schedule.startDate": 1, status: 1 });
campSchema.index({ "organizedBy.ngoId": 1 });

// Core methods
campSchema.methods = {
    async updateStatus(newStatus) {
        if (!CAMP_STATUS[newStatus]) {
            throw new ApiError(400, "Invalid status");
        }
        this.status = newStatus;
        return this.save();
    },

    async registerDonor(userId, slotId) {
        if (!this.registration.isOpen) {
            throw new ApiError(400, "Registration closed");
        }

        const slot = this.schedule.slots.id(slotId);
        if (!slot || slot.booked >= slot.capacity) {
            throw new ApiError(400, "Slot unavailable");
        }

        slot.booked += 1;
        this.registration.registeredDonors.push({
            userId,
            slotId,
            status: "Registered",
        });
        this.statistics.totalRegistrations += 1;

        return this.save();
    },
};

// Essential statics
campSchema.statics = {
    async findNearby(coordinates, radius = 10000) {
        return this.find({
            status: { $in: [CAMP_STATUS.PLANNED, CAMP_STATUS.ACTIVE] },
            "schedule.startDate": { $gte: new Date() },
            "venue.location": {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates,
                    },
                    $maxDistance: radius,
                },
            },
        }).select("name venue schedule status");
    },
};

export const DonationCamp = mongoose.model('DonationCamp', campSchema);
export { CAMP_STATUS, CAMP_TYPES };