import mongoose from 'mongoose';
import { ApiError } from "../../utils/ApiError.js";

// Constants
const TIME_SLOTS = {
    MORNING: "Morning", // 9:00 AM - 12:00 PM
    AFTERNOON: "Afternoon", // 1:00 PM - 4:00 PM
    EVENING: "Evening", // 5:00 PM - 8:00 PM
};

const APPOINTMENT_STATUS = {
    SCHEDULED: "Scheduled",
    CONFIRMED: "Confirmed",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
    RESCHEDULED: "Rescheduled",
    NO_SHOW: "No Show",
    DEFERRED: "Deferred",
};

const appointmentSchema = new mongoose.Schema(
    {
        appointmentId: {
            type: String,
            unique: true,
            default: () => `APT${Date.now()}`,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
            index: true,
        },
        centerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Center",
            required: [true, "Center ID is required"],
        },
        date: {
            type: Date,
            required: [true, "Appointment date is required"],
            validate: {
                validator: function (date) {
                    return date > new Date();
                },
                message: "Appointment date must be in the future",
            },
        },
        timeSlot: {
            type: String,
            enum: Object.values(TIME_SLOTS),
            required: [true, "Time slot is required"],
        },
        status: {
            type: String,
            enum: Object.values(APPOINTMENT_STATUS),
            default: APPOINTMENT_STATUS.SCHEDULED,
        },
        healthInformation: {
            hemoglobin: {
                type: Number,
                min: [12.5, "Hemoglobin must be at least 12.5 g/dL"],
                max: [20, "Hemoglobin too high"],
            },
            bloodPressure: {
                systolic: {
                    type: Number,
                    min: [90, "Systolic BP too low"],
                    max: [180, "Systolic BP too high"],
                },
                diastolic: {
                    type: Number,
                    min: [60, "Diastolic BP too low"],
                    max: [100, "Diastolic BP too high"],
                },
            },
            weight: {
                type: Number,
                min: [50, "Weight must be at least 50 kg"],
            },
            temperature: {
                type: Number,
                min: [35.5, "Temperature too low"],
                max: [37.5, "Temperature too high"],
            },
            pulseRate: {
                type: Number,
                min: [60, "Pulse rate too low"],
                max: [100, "Pulse rate too high"],
            },
            recordedAt: {
                type: Date,
                default: Date.now,
            },
        },
        donationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "BloodDonation",
        },
        statusHistory: [
            {
                status: {
                    type: String,
                    enum: Object.values(APPOINTMENT_STATUS),
                },
                updatedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                },
                reason: String,
                updatedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        cancellationReason: String,
        rescheduleCount: {
            type: Number,
            default: 0,
            max: [3, "Maximum reschedule limit reached"],
        },
        reminders: [
            {
                type: {
                    type: String,
                    enum: ["SMS", "Email", "Push"],
                },
                sentAt: Date,
                status: String,
            },
        ],
        notes: {
            public: String,
            internal: String,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
appointmentSchema.index({ date: 1, status: 1 });
appointmentSchema.index({ centerId: 1, date: 1 });
appointmentSchema.index({ userId: 1, date: -1 });

// Methods
appointmentSchema.methods = {
    async updateStatus(newStatus, userId, reason) {
        if (!Object.values(APPOINTMENT_STATUS).includes(newStatus)) {
            throw new ApiError(400, "Invalid status");
        }

        this.status = newStatus;
        this.statusHistory.push({
            status: newStatus,
            updatedBy: userId,
            reason,
            updatedAt: new Date(),
        });

        return this.save();
    },

    canReschedule() {
        return (
            this.rescheduleCount < 3 &&
            ["Scheduled", "Confirmed"].includes(this.status)
        );
    },

    isWithinCancellationWindow() {
        const hoursToAppointment = (this.date - new Date()) / (1000 * 60 * 60);
        return hoursToAppointment >= 24;
    },
};

// Statics
appointmentSchema.statics = {
    async findUpcoming(userId) {
        return this.find({
            userId,
            date: { $gt: new Date() },
            status: {
                $in: [
                    APPOINTMENT_STATUS.SCHEDULED,
                    APPOINTMENT_STATUS.CONFIRMED,
                ],
            },
        }).sort({ date: 1 });
    },

    async findSlotAvailability(centerId, date) {
        const appointments = await this.aggregate([
            {
                $match: {
                    centerId: mongoose.Types.ObjectId(centerId),
                    date: {
                        $gte: new Date(date).setHours(0, 0, 0),
                        $lt: new Date(date).setHours(23, 59, 59),
                    },
                    status: {
                        $in: [
                            APPOINTMENT_STATUS.SCHEDULED,
                            APPOINTMENT_STATUS.CONFIRMED,
                        ],
                    },
                },
            },
            {
                $group: {
                    _id: "$timeSlot",
                    count: { $sum: 1 },
                },
            },
        ]);

        return appointments;
    },
};

// Pre-save middleware
appointmentSchema.pre("save", function (next) {
    if (this.isNew) {
        this.statusHistory = [
            {
                status: this.status,
                updatedBy: this.userId,
                updatedAt: new Date(),
            },
        ];
    }
    next();
});

export const DonationAppointment = mongoose.model('DonationAppointment', appointmentSchema);
export { TIME_SLOTS, APPOINTMENT_STATUS };