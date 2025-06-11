import mongoose from "mongoose";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const STATUS_TYPES = {
    PENDING: "Pending",
    ACCEPTED: "Accepted",
    PROCESSING: "Processing",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
};

const plasmaRequestSchema = new mongoose.Schema(
    {
        requestId: {
            type: String,
            unique: true,
            required: true,
            default: () => `PR${Date.now()}`,
        },

        hospitalId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hospital",
            required: [true, "Hospital ID is required"],
            index: true,
        },

        bloodGroup: {
            type: String,
            enum: BLOOD_TYPES,
            required: [true, "Blood group is required"],
        },

        units: {
            type: Number,
            required: true,
            min: [1, "Minimum 1 unit required"],
            max: [10, "Maximum 10 units allowed"],
        },

        covidRecovered: {
            type: Boolean,
            default: false,
        },

        antibodyTiter: {
            type: String,
            enum: ["High", "Medium", "Low", "Unknown"],
            default: "Unknown",
        },

        patientInfo: {
            name: String,
            age: Number,
            gender: {
                type: String,
                enum: ["Male", "Female", "Other"],
            },
            covidStatus: {
                type: String,
                enum: ["Positive", "Negative", "Recovered", "Unknown"],
            },
            condition: String,
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

        urgency: {
            type: String,
            enum: ["Critical", "High", "Medium", "Low"],
            required: true,
        },

        requiredBy: {
            type: Date,
            required: true,
        },

        statusHistory: [
            {
                status: String,
                updatedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
                updatedAt: {
                    type: Date,
                    default: Date.now,
                },
                notes: String,
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Indexes
plasmaRequestSchema.index({ status: 1, urgency: 1 });
plasmaRequestSchema.index({ bloodGroup: 1, status: 1 });

const PlasmaRequest = mongoose.model("PlasmaRequest", plasmaRequestSchema);
export { PlasmaRequest };
