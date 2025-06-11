import mongoose from "mongoose";
import { ApiError } from "../../utils/ApiError.js";
const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const URGENCY_LEVELS = {
    EMERGENCY: "Emergency", // Need within 2 hours
    URGENT: "Urgent", // Need within 24 hours
    STANDARD: "Standard", // Need within 72 hours
    PLANNED: "Planned", // Future scheduled need
};

const STATUS_TYPES = {
    PENDING: "Pending",
    ACCEPTED: "Accepted",
    PROCESSING: "Processing",
    ASSIGNED: "Assigned",
    EN_ROUTE: "En Route",
    DELIVERED: "Delivered",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
    REJECTED: "Rejected",
};

const bloodRequestSchema = new mongoose.Schema(
    {
        requestId: {
            type: String,
            unique: true,
            required: true,
            default: () => `BR${Date.now()}`,
        },

        hospitalId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hospital",
            required: [true, "Hospital ID is required"],
            index: true,
        },

        ngoId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "NGO",
            required: [true, "NGO ID is required"],
            index: true,
        },

        bloodGroups: [
            {
                bloodGroup: {
                    type: String,
                    enum: {
                        values: BLOOD_TYPES,
                        message: "{VALUE} is not a valid blood group",
                    },
                    required: true,
                },
                units: {
                    type: Number,
                    required: true,
                    min: [1, "Minimum 1 unit required"],
                    max: [50, "Maximum 50 units allowed per request"],
                },
                fulfilledUnits: {
                    type: Number,
                    default: 0,
                },
                assignedDonations: [
                    {
                        donationId: {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: "BloodDonation",
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
            required: [true, "Required date is mandatory"],
            validate: {
                validator: function (date) {
                    return date > new Date();
                },
                message: "Required date must be in the future",
            },
        },

        patientInfo: {
            name: String,
            age: Number,
            gender: {
                type: String,
                enum: ["Male", "Female", "Other"],
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
                    ref: "User",
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
                ref: "User",
            },
            receivedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
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

        documents: [
            {
                name: String,
                fileUrl: String,
                fileType: {
                    type: String,
                    enum: [
                        "prescription",
                        "authorization",
                        "test_report",
                        "other",
                    ],
                },
                uploadedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
                uploadedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],

        priority: {
            type: Number,
            min: 1,
            max: 5,
            default: 3,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
bloodRequestSchema.index({ status: 1, urgencyLevel: 1 });
bloodRequestSchema.index({ hospitalId: 1, status: 1 });
bloodRequestSchema.index({ "deliveryDetails.coordinates": "2dsphere" });

// Methods
bloodRequestSchema.methods = {
    async updateStatus(newStatus, userId, notes) {
        if (!Object.values(STATUS_TYPES).includes(newStatus)) {
            throw new ApiError(400, "Invalid status");
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
        const totalRequested = this.bloodGroups.reduce(
            (sum, bg) => sum + bg.units,
            0
        );
        const totalFulfilled = this.bloodGroups.reduce(
            (sum, bg) => sum + bg.fulfilledUnits,
            0
        );
        return {
            totalRequested,
            totalFulfilled,
            percentageFulfilled: (totalFulfilled / totalRequested) * 100,
        };
    },
};

// Statics
bloodRequestSchema.statics = {
    async findUrgentRequests() {
        return this.find({
            urgencyLevel: {
                $in: [URGENCY_LEVELS.EMERGENCY, URGENCY_LEVELS.URGENT],
            },
            status: { $nin: [STATUS_TYPES.COMPLETED, STATUS_TYPES.CANCELLED] },
        }).sort({ priority: -1, createdAt: 1 });
    },

    async findPendingByBloodGroup(bloodGroup) {
        return this.find({
            "bloodGroups.bloodGroup": bloodGroup,
            status: STATUS_TYPES.PENDING,
        });
    },
};

export const BloodRequest = mongoose.model("BloodRequest", bloodRequestSchema);
export { BLOOD_TYPES };