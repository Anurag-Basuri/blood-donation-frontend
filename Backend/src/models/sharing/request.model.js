import mongoose from "mongoose";

// Resource Types and Status Enums
export const RESOURCE_TYPE = {
    EQUIPMENT: "EQUIPMENT",
    MEDICINE: "MEDICINE",
};

export const RESOURCE_STATUS = {
    AVAILABLE: "AVAILABLE",
    IN_USE: "IN_USE",
    MAINTENANCE: "MAINTENANCE",
    DISPOSED: "DISPOSED",
    EXPIRED: "EXPIRED",
    RESERVED: "RESERVED",
};

export const CONDITION_TYPES = {
    EXCELLENT: "EXCELLENT",
    GOOD: "GOOD",
    FAIR: "FAIR",
    NEEDS_REPAIR: "NEEDS_REPAIR",
};

// Base Resource Schema
const resourceSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Resource name is required"],
            trim: true,
        },
        resourceType: {
            type: String,
            enum: Object.values(RESOURCE_TYPE),
            required: true,
        },
        owner: {
            entityId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                refPath: "owner.entityType",
            },
            entityType: {
                type: String,
                required: true,
                enum: ["Hospital", "NGO", "User"],
            },
        },
        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
            },
            coordinates: {
                type: [Number],
                required: true,
            },
            address: {
                street: String,
                city: String,
                state: String,
                pinCode: String,
            },
        },
        status: {
            current: {
                type: String,
                enum: Object.values(RESOURCE_STATUS),
                default: RESOURCE_STATUS.AVAILABLE,
            },
            lastUpdated: {
                type: Date,
                default: Date.now,
            },
            history: [
                {
                    status: String,
                    timestamp: Date,
                    updatedBy: {
                        type: mongoose.Schema.Types.ObjectId,
                        refPath: "owner.entityType",
                    },
                    reason: String,
                },
            ],
        },
        verification: {
            isVerified: {
                type: Boolean,
                default: false,
            },
            verifiedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Admin",
            },
            verifiedAt: Date,
            documents: [
                {
                    type: String,
                    url: String,
                    uploadedAt: Date,
                },
            ],
        },
    },
    {
        timestamps: true,
        discriminatorKey: "resourceType",
    }
);

// Equipment specific schema
const equipmentSchema = new mongoose.Schema({
    details: {
        model: String,
        manufacturer: String,
        serialNumber: String,
        yearOfManufacture: Number,
        condition: {
            type: String,
            enum: Object.values(CONDITION_TYPES),
            required: true,
        },
        specifications: mongoose.Schema.Types.Mixed,
    },
    maintenance: {
        lastMaintenance: Date,
        nextMaintenanceDue: Date,
        maintenanceHistory: [
            {
                date: Date,
                type: String,
                description: String,
                cost: Number,
                performedBy: String,
            },
        ],
    },
    availability: {
        isAvailable: {
            type: Boolean,
            default: true,
        },
        currentUser: {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                refPath: "availability.currentUser.userType",
            },
            userType: String,
            fromDate: Date,
            expectedReturnDate: Date,
        },
        usageHistory: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    refPath: "availability.usageHistory.userType",
                },
                userType: String,
                fromDate: Date,
                toDate: Date,
                purpose: String,
            },
        ],
    },
});

// Medicine specific schema
const medicineSchema = new mongoose.Schema({
    details: {
        category: {
            type: String,
            required: true,
        },
        composition: String,
        manufacturer: String,
        batchNumber: String,
        prescriptionRequired: {
            type: Boolean,
            default: false,
        },
    },
    expiry: {
        manufacturingDate: Date,
        expiryDate: {
            type: Date,
            required: true,
        },
    },
    storage: {
        temperature: String,
        requirements: String,
        specialInstructions: String,
    },
    quantity: {
        available: {
            type: Number,
            required: true,
            min: 0,
        },
        unit: {
            type: String,
            required: true,
        },
        threshold: {
            type: Number,
            default: 10,
        },
    },
});

// Indexes
resourceSchema.index({ location: "2dsphere" });
resourceSchema.index({ "status.current": 1 });
resourceSchema.index({ resourceType: 1, "status.current": 1 });

// Methods
resourceSchema.methods.updateStatus = async function (
    newStatus,
    updatedBy,
    reason
) {
    this.status.history.push({
        status: this.status.current,
        timestamp: this.status.lastUpdated,
        updatedBy,
        reason,
    });

    this.status.current = newStatus;
    this.status.lastUpdated = new Date();
    return this.save();
};

// Create base model
const Resource = mongoose.model("Resource", resourceSchema);

// Create discriminated models
export const Equipment = Resource.discriminator(
    RESOURCE_TYPE.EQUIPMENT,
    equipmentSchema
);

export const Medicine = Resource.discriminator(
    RESOURCE_TYPE.MEDICINE,
    medicineSchema
);

export default Resource;
