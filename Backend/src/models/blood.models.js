import mongoose from 'mongoose';
import { ApiError } from "../utils/ApiError.js";

// Constants for blood donation
const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const MIN_DONATION_AMOUNT = 200; // ml
const MAX_DONATION_AMOUNT = 500; // ml
const STANDARD_DONATION_AMOUNT = 450; // ml
const BLOOD_EXPIRY_DAYS = 42; // Whole blood expiry

const bloodDonationSchema = new mongoose.Schema(
    {
        // Donor Information
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Donor information is required"],
            index: true,
        },

        // Collection Information
        ngoId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "NGO",
            required: [true, "Collection NGO is required"],
            index: true,
        },

        centerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Center",
            required: [true, "Collection center is required"],
            index: true,
        },

        centerType: {
            type: String,
            enum: {
                values: ["DonationCamp", "BloodBank"],
                message: "{VALUE} is not a valid center type",
            },
            required: true,
        },

        // Blood Information
        bloodGroup: {
            type: String,
            required: true,
            enum: {
                values: BLOOD_TYPES,
                message: "{VALUE} is not a valid blood group",
            },
            index: true,
        },

        donationAmount: {
            type: Number,
            required: true,
            min: [
                MIN_DONATION_AMOUNT,
                `Minimum donation amount is ${MIN_DONATION_AMOUNT}ml`,
            ],
            max: [
                MAX_DONATION_AMOUNT,
                `Maximum donation amount is ${MAX_DONATION_AMOUNT}ml`,
            ],
            default: STANDARD_DONATION_AMOUNT,
        },

        // Donation Details
        donationDate: {
            type: Date,
            required: true,
            default: Date.now,
            validate: {
                validator: function (date) {
                    return date <= new Date();
                },
                message: "Donation date cannot be in the future",
            },
        },

        donationCenter: {
            name: {
                type: String,
                required: true,
            },
            address: String,
            coordinates: {
                type: {
                    type: String,
                    enum: ["Point"],
                    default: "Point",
                },
                coordinates: {
                    type: [Number],
                    validate: {
                        validator: function (coords) {
                            return (
                                coords.length === 2 &&
                                coords[0] >= -180 &&
                                coords[0] <= 180 &&
                                coords[1] >= -90 &&
                                coords[1] <= 90
                            );
                        },
                        message: "Invalid coordinates",
                    },
                },
            },
        },

        // Health Metrics
        healthMetrics: {
            hemoglobin: {
                type: Number,
                min: [12, "Hemoglobin too low"],
                max: [20, "Hemoglobin too high"],
            },
            bloodPressure: {
                systolic: {
                    type: Number,
                    min: [90, "Systolic pressure too low"],
                    max: [180, "Systolic pressure too high"],
                },
                diastolic: {
                    type: Number,
                    min: [60, "Diastolic pressure too low"],
                    max: [110, "Diastolic pressure too high"],
                },
            },
            pulse: {
                type: Number,
                min: [60, "Pulse too low"],
                max: [100, "Pulse too high"],
            },
            temperature: {
                type: Number,
                min: [35.5, "Temperature too low"],
                max: [37.5, "Temperature too high"],
            },
            weight: {
                type: Number,
                min: [45, "Weight too low"],
            },
        },

        // Status Management
        status: {
            type: String,
            enum: [
                "processing",
                "available",
                "assigned",
                "used",
                "expired",
                "discarded",
            ],
            default: "processing",
            index: true,
        },

        expiryDate: {
            type: Date,
            index: true,
        },

        // Transfer History
        transferHistory: [
            {
                fromId: {
                    type: mongoose.Schema.Types.ObjectId,
                    refPath: "transferHistory.fromType",
                    required: true,
                },
                fromType: {
                    type: String,
                    enum: ["NGO", "Center", "Hospital"],
                    required: true,
                },
                toId: {
                    type: mongoose.Schema.Types.ObjectId,
                    refPath: "transferHistory.toType",
                    required: true,
                },
                toType: {
                    type: String,
                    enum: ["NGO", "Center", "Hospital"],
                    required: true,
                },
                transferDate: {
                    type: Date,
                    default: Date.now,
                    required: true,
                },
                reason: {
                    type: String,
                    required: true,
                },
                transferredBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Admin",
                    required: true,
                },
            },
        ],

        // Current Location
        currentLocation: {
            entityId: {
                type: mongoose.Schema.Types.ObjectId,
                refPath: "currentLocation.entityType",
                required: true,
            },
            entityType: {
                type: String,
                enum: ["NGO", "Center", "Hospital"],
                required: true,
            },
            updatedAt: {
                type: Date,
                default: Date.now,
            },
        },

        // Quality Control
        qualityChecks: [
            {
                checkType: {
                    type: String,
                    enum: ["visual", "serological", "compatibility"],
                    required: true,
                },
                result: {
                    type: String,
                    enum: ["pass", "fail", "pending"],
                    required: true,
                },
                checkedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Admin",
                    required: true,
                },
                checkDate: {
                    type: Date,
                    default: Date.now,
                },
                notes: String,
            },
        ],

        notes: String,
        adminNotes: String,

        lastVerifiedBy: {
            adminId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Admin",
            },
            date: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
bloodDonationSchema.index({ ngoId: 1, status: 1 });
bloodDonationSchema.index({ centerId: 1, bloodGroup: 1 });
bloodDonationSchema.index({ status: 1, expiryDate: 1 });
bloodDonationSchema.index({
    "currentLocation.entityId": 1,
    "currentLocation.entityType": 1,
});
bloodDonationSchema.index({ "donationCenter.coordinates": "2dsphere" });

// Pre-save middleware
bloodDonationSchema.pre("save", function (next) {
    if (this.isNew || !this.expiryDate) {
        this.expiryDate = new Date(this.donationDate);
        this.expiryDate.setDate(this.expiryDate.getDate() + BLOOD_EXPIRY_DAYS);
    }

    if (!this.currentLocation.entityId) {
        this.currentLocation = {
            entityId: this.centerId,
            entityType: "Center",
            updatedAt: new Date(),
        };
    }

    next();
});

// Methods
bloodDonationSchema.methods = {
    isValid() {
        return this.status === "available" && new Date() < this.expiryDate;
    },

    async transferTo(toEntityId, toEntityType, reason, adminId) {
        if (!this.isValid()) {
            throw new ApiError(400, "Invalid blood unit for transfer");
        }

        this.transferHistory.push({
            fromId: this.currentLocation.entityId,
            fromType: this.currentLocation.entityType,
            toId: toEntityId,
            toType: toEntityType,
            transferDate: new Date(),
            reason,
            transferredBy: adminId,
        });

        this.currentLocation = {
            entityId: toEntityId,
            entityType: toEntityType,
            updatedAt: new Date(),
        };

        return this.save();
    },

    addQualityCheck(checkData) {
        this.qualityChecks.push(checkData);
        if (checkData.result === "fail") {
            this.status = "discarded";
        }
        return this.save();
    },
};

// Static methods
bloodDonationSchema.statics = {
    async findAvailableByBloodGroup(bloodGroup, options = {}) {
        const query = {
            bloodGroup,
            status: "available",
            expiryDate: { $gt: new Date() },
        };

        if (options.ngoId) query.ngoId = options.ngoId;
        if (options.centerId) query.centerId = options.centerId;
        if (options.location) {
            query["donationCenter.coordinates"] = {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: options.location,
                    },
                    $maxDistance: options.radius || 50000, // 50km default
                },
            };
        }

        return this.find(query)
            .sort({ expiryDate: 1 })
            .populate("ngoId", "name")
            .populate("centerId", "name location")
            .populate("currentLocation.entityId", "name location");
    },

    async getInventoryStats() {
        return this.aggregate([
            {
                $match: {
                    status: "available",
                    expiryDate: { $gt: new Date() },
                },
            },
            {
                $group: {
                    _id: "$bloodGroup",
                    count: { $sum: 1 },
                    totalVolume: { $sum: "$donationAmount" },
                },
            },
        ]);
    },
};

const BloodDonation = mongoose.model('BloodDonation', bloodDonationSchema);

export default BloodDonation;