import mongoose from 'mongoose';
import { ApiError } from "../utils/ApiError.js";

// Constants
const CAMP_STATUS = {
    PLANNED: 'Planned',
    ACTIVE: 'Active',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
    POSTPONED: 'Postponed'
};

const CAMP_TYPES = {
    GENERAL: 'General',
    CORPORATE: 'Corporate',
    EDUCATIONAL: 'Educational',
    COMMUNITY: 'Community',
    EMERGENCY: 'Emergency'
};

const campSchema = new mongoose.Schema({
    // Basic Camp Information
    campId: {
        type: String,
        unique: true,
        default: () => `CAMP${Date.now()}`
    },
    name: {
        type: String,
        required: [true, "Camp name is required"],
        trim: true,
        minlength: [3, "Name must be at least 3 characters"]
    },
    description: String,
    type: {
        type: String,
        enum: Object.values(CAMP_TYPES),
        required: true,
        default: CAMP_TYPES.GENERAL
    },

    // Organizing Details
    organizedBy: {
        ngoId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'NGO',
            required: true
        },
        centerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Center'
        }
    },

    // Timing Information
    schedule: {
        startDate: {
            type: Date,
            required: true,
            validate: {
                validator: function(date) {
                    return date > new Date();
                },
                message: "Start date must be in the future"
            }
        },
        endDate: {
            type: Date,
            required: true,
            validate: {
                validator: function(date) {
                    return date >= this.schedule.startDate;
                },
                message: "End date must be after start date"
            }
        },
        operatingHours: [{
            day: {
                type: String,
                enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
            },
            startTime: String,
            endTime: String,
            maxAppointments: {
                type: Number,
                default: 50
            }
        }]
    },

    // Location Details
    venue: {
        name: {
            type: String,
            required: true
        },
        address: {
            street: String,
            city: {
                type: String,
                required: true,
                index: true
            },
            state: String,
            pinCode: {
                type: String,
                required: true,
                validate: {
                    validator: function(v) {
                        return /^\d{6}$/.test(v);
                    },
                    message: "Invalid PIN code"
                }
            },
            country: {
                type: String,
                default: "India"
            }
        },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number],
                required: true,
                validate: {
                    validator: function(coords) {
                        return coords.length === 2 &&
                               coords[0] >= -180 && coords[0] <= 180 &&
                               coords[1] >= -90 && coords[1] <= 90;
                    },
                    message: "Invalid coordinates"
                }
            }
        },
        facilities: [String]
    },

    // Capacity and Goals
    capacity: {
        totalSlots: {
            type: Number,
            required: true,
            min: [1, "Must have at least 1 slot"]
        },
        slotsPerHour: {
            type: Number,
            default: 10
        },
        expectedDonors: Number,
        targetCollection: Number
    },

    // Registration and Appointments
    registration: {
        isOpen: {
            type: Boolean,
            default: true
        },
        startDate: Date,
        endDate: Date,
        requiredDocuments: [String],
        eligibilityCriteria: [String],
        registeredDonors: [{
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            registrationDate: {
                type: Date,
                default: Date.now
            },
            appointmentSlot: {
                date: Date,
                timeSlot: String
            },
            status: {
                type: String,
                enum: ['Registered', 'Confirmed', 'Cancelled', 'Completed', 'No Show'],
                default: 'Registered'
            }
        }]
    },

    // Partners and Sponsors
    partners: [{
        name: String,
        type: String,
        contribution: String,
        logo: String
    }],

    // Status and Progress
    status: {
        type: String,
        enum: Object.values(CAMP_STATUS),
        default: CAMP_STATUS.PLANNED
    },
    statusHistory: [{
        status: {
            type: String,
            enum: Object.values(CAMP_STATUS)
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin'
        },
        reason: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],

    // Statistics and Metrics
    statistics: {
        registrations: {
            type: Number,
            default: 0
        },
        actualDonors: {
            type: Number,
            default: 0
        },
        bloodCollected: {
            type: Number,
            default: 0
        },
        successRate: {
            type: Number,
            default: 0
        },
        bloodGroupwise: [{
            bloodGroup: String,
            units: Number
        }],
        demographics: {
            ageGroups: Map,
            gender: Map,
            firstTimeDonors: Number
        }
    },

    // Media and Documentation
    media: {
        images: [String],
        videos: [String],
        documents: [{
            name: String,
            url: String,
            type: String
        }]
    },

    // Emergency Response
    emergencyContact: {
        name: String,
        phone: String,
        email: String,
        available24x7: Boolean
    }
}, {
    timestamps: true
});

// Indexes
campSchema.index({ "venue.location": "2dsphere" });
campSchema.index({ "schedule.startDate": 1, status: 1 });
campSchema.index({ "organizedBy.ngoId": 1 });
campSchema.index({ campId: 1 }, { unique: true });

// Methods
campSchema.methods = {
    async updateStatus(newStatus, adminId, reason) {
        if (!Object.values(CAMP_STATUS).includes(newStatus)) {
            throw new ApiError(400, "Invalid status");
        }

        this.status = newStatus;
        this.statusHistory.push({
            status: newStatus,
            updatedBy: adminId,
            reason,
            timestamp: new Date()
        });

        return this.save();
    },

    async checkSlotAvailability(date, timeSlot) {
        const registeredCount = this.registration.registeredDonors.filter(
            donor => donor.appointmentSlot.date.toDateString() === date.toDateString() &&
                    donor.appointmentSlot.timeSlot === timeSlot &&
                    ['Registered', 'Confirmed'].includes(donor.status)
        ).length;

        const maxSlots = this.capacity.slotsPerHour;
        return registeredCount < maxSlots;
    },

    async registerDonor(userData) {
        if (!this.registration.isOpen) {
            throw new ApiError(400, "Registration is closed");
        }

        const { userId, appointmentSlot } = userData;
        const isSlotAvailable = await this.checkSlotAvailability(
            appointmentSlot.date,
            appointmentSlot.timeSlot
        );

        if (!isSlotAvailable) {
            throw new ApiError(400, "Selected slot is full");
        }

        this.registration.registeredDonors.push({
            userId,
            appointmentSlot,
            registrationDate: new Date(),
            status: 'Registered'
        });

        this.statistics.registrations += 1;
        return this.save();
    }
};

// Statics
campSchema.statics = {
    async findActiveCamps(location, radius = 10000) {
        return this.find({
            status: { $in: [CAMP_STATUS.PLANNED, CAMP_STATUS.ACTIVE] },
            "schedule.startDate": { $gte: new Date() },
            "venue.location": {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: location
                    },
                    $maxDistance: radius
                }
            }
        }).populate('organizedBy.ngoId', 'name');
    },

    async getCampStatistics(ngoId) {
        return this.aggregate([
            {
                $match: {
                    "organizedBy.ngoId": mongoose.Types.ObjectId(ngoId),
                    status: CAMP_STATUS.COMPLETED
                }
            },
            {
                $group: {
                    _id: null,
                    totalCamps: { $sum: 1 },
                    totalDonors: { $sum: "$statistics.actualDonors" },
                    totalCollection: { $sum: "$statistics.bloodCollected" },
                    averageSuccessRate: { $avg: "$statistics.successRate" }
                }
            }
        ]);
    }
};

export const DonationCamp = mongoose.model('DonationCamp', campSchema);
export { CAMP_STATUS, CAMP_TYPES };