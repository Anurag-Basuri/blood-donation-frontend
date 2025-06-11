import mongoose from "mongoose";

// Resource Types and Status Enums
export const RESOURCE_TYPE = {
    EQUIPMENT: "EQUIPMENT",
    MEDICINE: "MEDICINE",
    SUPPLIES: "SUPPLIES",
};

export const REQUEST_STATUS = {
    PENDING: "PENDING",
    APPROVED: "APPROVED",
    REJECTED: "REJECTED",
    CANCELLED: "CANCELLED",
    COMPLETED: "COMPLETED",
    EXPIRED: "EXPIRED",
};

export const REQUEST_PRIORITY = {
    LOW: "LOW",
    MEDIUM: "MEDIUM",
    HIGH: "HIGH",
    URGENT: "URGENT",
};

// Resource Request Schema
const requestSchema = new mongoose.Schema(
    {
        requesterId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: "requesterType",
        },
        requesterType: {
            type: String,
            required: true,
            enum: ["Hospital", "NGO"],
        },
        resourceId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: "resourceType",
        },
        resourceType: {
            type: String,
            required: true,
            enum: Object.values(RESOURCE_TYPE),
        },
        quantity: {
            requested: {
                type: Number,
                required: true,
                min: 1,
            },
            approved: Number,
        },
        duration: {
            startDate: {
                type: Date,
                required: true,
            },
            endDate: {
                type: Date,
                required: true,
                validate: {
                    validator: function (endDate) {
                        return endDate > this.duration.startDate;
                    },
                    message: "End date must be after start date",
                },
            },
        },
        status: {
            current: {
                type: String,
                enum: Object.values(REQUEST_STATUS),
                default: REQUEST_STATUS.PENDING,
            },
            history: [
                {
                    status: String,
                    updatedBy: {
                        type: mongoose.Schema.Types.ObjectId,
                        refPath: "status.history.updaterType",
                    },
                    updaterType: {
                        type: String,
                        enum: ["Hospital", "NGO", "Admin"],
                    },
                    timestamp: {
                        type: Date,
                        default: Date.now,
                    },
                    reason: String,
                },
            ],
        },
        priority: {
            type: String,
            enum: Object.values(REQUEST_PRIORITY),
            default: REQUEST_PRIORITY.MEDIUM,
        },
        purpose: {
            type: String,
            required: true,
            minlength: 10,
            maxlength: 500,
        },
        additionalDetails: {
            requirements: String,
            preferredLocation: {
                type: {
                    type: String,
                    enum: ["Point"],
                    default: "Point",
                },
                coordinates: {
                    type: [Number],
                    validate: {
                        validator: function (coords) {
                            return coords.length === 2;
                        },
                        message: "Coordinates must be [longitude, latitude]",
                    },
                },
            },
            urgencyJustification: String,
            attachments: [
                {
                    name: String,
                    url: String,
                    type: String,
                    uploadedAt: {
                        type: Date,
                        default: Date.now,
                    },
                },
            ],
        },
        approvalDetails: {
            approvedBy: {
                type: mongoose.Schema.Types.ObjectId,
                refPath: "approvalDetails.approverType",
            },
            approverType: {
                type: String,
                enum: ["Hospital", "NGO", "Admin"],
            },
            approvedAt: Date,
            conditions: String,
            notes: String,
        },
        communication: [
            {
                sender: {
                    id: {
                        type: mongoose.Schema.Types.ObjectId,
                        refPath: "communication.sender.type",
                    },
                    type: {
                        type: String,
                        enum: ["Hospital", "NGO", "Admin"],
                    },
                },
                message: String,
                timestamp: {
                    type: Date,
                    default: Date.now,
                },
                attachments: [
                    {
                        name: String,
                        url: String,
                        type: String,
                    },
                ],
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Indexes
requestSchema.index({ requesterId: 1, status: 1 });
requestSchema.index({ resourceId: 1 });
requestSchema.index({ "status.current": 1 });
requestSchema.index({ priority: 1, "status.current": 1 });
requestSchema.index({ "additionalDetails.preferredLocation": "2dsphere" });

// Methods
requestSchema.methods.updateStatus = async function (
    newStatus,
    updatedBy,
    updaterType,
    reason
) {
    this.status.history.push({
        status: this.status.current,
        updatedBy,
        updaterType,
        timestamp: new Date(),
        reason,
    });
    this.status.current = newStatus;

    if (newStatus === REQUEST_STATUS.APPROVED) {
        this.approvalDetails = {
            approvedBy: updatedBy,
            approverType: updaterType,
            approvedAt: new Date(),
        };
    }

    return this.save();
};

requestSchema.methods.addCommunication = async function (
    sender,
    message,
    attachments = []
) {
    this.communication.push({
        sender,
        message,
        attachments,
        timestamp: new Date(),
    });
    return this.save();
};

// Statics
requestSchema.statics.findPendingRequests = function(resourceId) {
    return this.find({
        resourceId,
        "status.current": REQUEST_STATUS.PENDING
    }).sort({ priority: -1, createdAt: 1 });
};

// Export model
export const Request = mongoose.model('Request', requestSchema);
