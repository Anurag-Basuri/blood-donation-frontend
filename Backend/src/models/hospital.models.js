import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ApiError } from "../utils/ApiError.js";

// Constants
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const HOSPITAL_TYPES = [
    "Blood Bank",
    "Trauma Center",
    "General Hospital",
    "Specialty Hospital",
    "Clinic",
    "Other",
];
const URGENCY_LEVELS = ["Emergency", "High", "Regular", "Future Need"];

const hospitalSchema = new mongoose.Schema(
    {
        // Basic Information
        name: {
            type: String,
            required: [true, "Hospital name is required"],
            trim: true,
            minlength: [3, "Name must be at least 3 characters"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
                "Please enter a valid email",
            ],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [8, "Password must be at least 8 characters"],
            select: false,
            validate: {
                validator: function (password) {
                    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
                        password
                    );
                },
                message:
                    "Password must contain uppercase, lowercase, number and special character",
            },
        },

        // Verification
        isVerified: {
            type: Boolean,
            default: false,
        },
        verificationOTP: {
            code: String,
            expiresAt: Date,
        },
        refreshToken: {
            type: String,
            select: false,
        },

        // Contact Information
        contactPerson: {
            name: {
                type: String,
                required: true,
            },
            phone: {
                type: String,
                required: true,
                validate: {
                    validator: function (v) {
                        return /^\+?[\d\s-]{10,}$/.test(v);
                    },
                    message: "Invalid phone number format",
                },
            },
            position: String,
            email: {
                type: String,
                validate: {
                    validator: function (v) {
                        return (
                            !v ||
                            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/.test(v)
                        );
                    },
                    message: "Invalid email format",
                },
            },
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
                    validator: function (v) {
                        return /^\+?[\d\s-]{10,}$/.test(v);
                    },
                    message: "Invalid emergency phone number",
                },
            },
            available24x7: {
                type: Boolean,
                default: true,
            },
        },

        // Location
        address: {
            street: {
                type: String,
                required: true,
            },
            city: {
                type: String,
                required: true,
                index: true,
            },
            state: {
                type: String,
                required: true,
            },
            pinCode: {
                type: String,
                required: true,
                validate: {
                    validator: function (v) {
                        return /^\d{6}$/.test(v);
                    },
                    message: "Invalid PIN code",
                },
            },
            country: {
                type: String,
                default: "India",
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

        // Hospital Details
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
                validator: function (v) {
                    return /^[A-Z0-9-]{5,}$/i.test(v);
                },
                message: "Invalid registration number format",
            },
        },

        // Blood Bank Management
        bloodRequirements: [
            {
                bloodGroup: {
                    type: String,
                    enum: BLOOD_GROUPS,
                    required: true,
                },
                unitsNeeded: {
                    type: Number,
                    min: [1, "Minimum 1 unit required"],
                    required: true,
                },
                urgencyLevel: {
                    type: String,
                    enum: URGENCY_LEVELS,
                    default: "Regular",
                },
                requiredBy: {
                    type: Date,
                    required: true,
                },
            },
        ],

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

        // NGO Connections
        connectedNGOs: [
            {
                ngoId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "NGO",
                },
                status: {
                    type: String,
                    enum: ["Pending", "Approved", "Rejected", "Blocked"],
                    default: "Pending",
                },
                connectedDate: {
                    type: Date,
                    default: Date.now,
                },
                lastTransactionDate: Date,
                totalTransactions: {
                    type: Number,
                    default: 0,
                },
            },
        ],

        // Statistics
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
            lastRequestDate: Date,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes
hospitalSchema.index({ "address.city": 1, "address.pinCode": 1 });
hospitalSchema.index({ "address.location": "2dsphere" });
hospitalSchema.index({
    "bloodRequirements.bloodGroup": 1,
    "bloodRequirements.urgencyLevel": 1,
});
hospitalSchema.index({ "connectedNGOs.ngoId": 1, "connectedNGOs.status": 1 });

// Virtuals
hospitalSchema.virtual("pendingRequests", {
    ref: "BloodRequest",
    localField: "_id",
    foreignField: "hospitalId",
    match: { status: { $in: ["Pending", "Processing"] } },
});

// Methods
hospitalSchema.methods = {
    async comparePassword(candidatePassword) {
        return await bcrypt.compare(candidatePassword, this.password);
    },

    async findNearbyNGOs(maxDistance = 10000) {
        return mongoose.model("NGO").find({
            "address.location": {
                $near: {
                    $geometry: this.address.location,
                    $maxDistance: maxDistance,
                },
            },
            isVerified: true,
        });
    },

    async updateBloodInventory(bloodGroup, change) {
        const inventory = this.bloodInventory.find(
            (i) => i.bloodGroup === bloodGroup
        );
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

    async requestBlood(bloodGroup, units, urgencyLevel) {
        if (!BLOOD_GROUPS.includes(bloodGroup)) {
            throw new ApiError(400, "Invalid blood group");
        }

        this.bloodRequirements.push({
            bloodGroup,
            unitsNeeded: units,
            urgencyLevel,
            requiredBy: new Date(),
        });

        this.statistics.totalRequestsMade += 1;
        if (urgencyLevel === "Emergency") {
            this.statistics.emergencyRequests += 1;
        }
        this.statistics.lastRequestDate = new Date();

        return this.save();
    },
};

// Pre-save middleware
hospitalSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

const Hospital = mongoose.model('Hospital', hospitalSchema);

export default Hospital;