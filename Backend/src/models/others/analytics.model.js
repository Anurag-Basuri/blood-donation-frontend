import mongoose from "mongoose";

const ANALYTICS_TYPES = {
    // Donation Analytics
    BLOOD_DONATION: "blood_donation",
    PLASMA_DONATION: "plasma_donation",
    ORGAN_PLEDGE: "organ_pledge",

    // Request Analytics
    BLOOD_REQUESTS: "blood_requests",
    EMERGENCY_REQUESTS: "emergency_requests",
    FULFILLED_REQUESTS: "fulfilled_requests",

    // Camp Analytics
    CAMP_PERFORMANCE: "camp_performance",
    DONOR_ATTENDANCE: "donor_attendance",

    // User Analytics
    DONOR_ENGAGEMENT: "donor_engagement",
    VOLUNTEER_ACTIVITY: "volunteer_activity",

    // Location Analytics
    GEOGRAPHIC_COVERAGE: "geographic_coverage",
    DEMAND_HOTSPOTS: "demand_hotspots",
};

const analyticsSchema = new mongoose.Schema(
    {
        analyticsId: {
            type: String,
            unique: true,
            default: () => `ANALYTICS${Date.now()}`,
        },

        type: {
            type: String,
            enum: Object.values(ANALYTICS_TYPES),
            required: true,
            index: true,
        },

        timeframe: {
            start: {
                type: Date,
                required: true,
            },
            end: {
                type: Date,
                required: true,
            },
            interval: {
                type: String,
                enum: ["daily", "weekly", "monthly", "quarterly", "yearly"],
                default: "daily",
            },
        },

        metrics: {
            // Blood Donation Metrics
            donations: {
                total: Number,
                successful: Number,
                rejected: Number,
                byBloodGroup: Map,
            },

            // Request Metrics
            requests: {
                total: Number,
                fulfilled: Number,
                pending: Number,
                emergency: Number,
                averageFulfillmentTime: Number,
            },

            // Camp Metrics
            camps: {
                total: Number,
                activeCount: Number,
                totalRegistrations: Number,
                actualDonors: Number,
                collectedUnits: Number,
            },

            // User Metrics
            users: {
                newDonors: Number,
                repeatDonors: Number,
                activeVolunteers: Number,
            },

            // Location Based
            coverage: {
                cities: [String],
                states: [String],
                hotspots: [
                    {
                        location: {
                            type: {
                                type: String,
                                enum: ["Point"],
                                default: "Point",
                            },
                            coordinates: [Number],
                        },
                        intensity: Number,
                        requestCount: Number,
                    },
                ],
            },
        },

        insights: [
            {
                type: String,
                description: String,
                severity: {
                    type: String,
                    enum: ["low", "medium", "high", "critical"],
                },
                suggestedAction: String,
            },
        ],

        source: {
            entityType: {
                type: String,
                enum: ["NGO", "Hospital", "Center", "System"],
            },
            entityId: mongoose.Schema.Types.ObjectId,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for quick querying
analyticsSchema.index({ type: 1, "timeframe.start": 1, "timeframe.end": 1 });
analyticsSchema.index({ "source.entityType": 1, "source.entityId": 1 });
analyticsSchema.index({ "metrics.coverage.hotspots.location": "2dsphere" });

// Static methods for analytics generation
analyticsSchema.statics = {
    async generateDonationAnalytics(startDate, endDate) {
        return this.aggregate([
            {
                $match: {
                    type: ANALYTICS_TYPES.BLOOD_DONATION,
                    "timeframe.start": { $gte: startDate },
                    "timeframe.end": { $lte: endDate },
                },
            },
            {
                $group: {
                    _id: null,
                    totalDonations: { $sum: "$metrics.donations.total" },
                    successfulDonations: {
                        $sum: "$metrics.donations.successful",
                    },
                    averageFulfillment: {
                        $avg: "$metrics.requests.averageFulfillmentTime",
                    },
                },
            },
        ]);
    },

    async getLocationHotspots(radius = 5000) {
        return this.aggregate([
            {
                $match: {
                    type: ANALYTICS_TYPES.DEMAND_HOTSPOTS,
                },
            },
            {
                $unwind: "$metrics.coverage.hotspots",
            },
            {
                $group: {
                    _id: "$metrics.coverage.hotspots.location",
                    totalRequests: {
                        $sum: "$metrics.coverage.hotspots.requestCount",
                    },
                    avgIntensity: {
                        $avg: "$metrics.coverage.hotspots.intensity",
                    },
                },
            },
        ]);
    },
};

const Analytics = mongoose.model("Analytics", analyticsSchema);
export { Analytics, ANALYTICS_TYPES };
