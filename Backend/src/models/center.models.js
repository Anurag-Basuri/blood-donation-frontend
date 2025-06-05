import mongoose from 'mongoose';
import { BLOOD_TYPES } from "./blood.models.js";

const CENTER_STATUS = {
    ACTIVE: "Active",
    INACTIVE: "Inactive",
    SUSPENDED: "Suspended",
};

const centerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Center name is required"],
            trim: true,
        },
        ngoId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "NGO",
            required: true,
        },
        contactInfo: {
            person: {
                name: String,
                phone: String,
                email: String,
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
                        message: "Invalid PIN code",
                    },
                },
            },
            location: {
                type: { type: String, enum: ["Point"], default: "Point" },
                coordinates: [Number],
            },
        },
        operatingHours: [
            {
                day: {
                    type: String,
                    enum: [
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday",
                        "Saturday",
                        "Sunday",
                    ],
                },
                open: String,
                close: String,
            },
        ],
        bloodInventory: [
            {
                bloodGroup: { type: String, enum: BLOOD_TYPES },
                available: { type: Number, default: 0 },
                reserved: { type: Number, default: 0 },
                lastUpdated: Date,
            },
        ],
        facilities: [
            {
                type: String,
                enum: [
                    "Blood Testing",
                    "Blood Storage",
                    "Transport",
                    "Emergency Response",
                ],
            },
        ],
        status: {
            type: String,
            enum: Object.values(CENTER_STATUS),
            default: CENTER_STATUS.ACTIVE,
        },
        license: {
            number: String,
            validUntil: Date,
            issuedBy: String,
        },
    },
    {
        timestamps: true,
    }
);

// Essential indexes
centerSchema.index({ "contactInfo.location": "2dsphere" });
centerSchema.index({ "contactInfo.address.city": 1 });
centerSchema.index({ ngoId: 1, status: 1 });

// Core methods only
centerSchema.methods = {
    async updateInventory(bloodGroup, change) {
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
};

export const Center = mongoose.model("Center", centerSchema);
export { CENTER_STATUS };