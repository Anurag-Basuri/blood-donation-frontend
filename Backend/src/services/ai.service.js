import OpenAI from "openai";
import { ApiError } from "../utils/ApiError.js";
import { Blood } from "../models/blood.models.js";
import { User } from "../models/user.models.js";
import { Hospital } from "../models/hospital.models.js";

class AiService {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    async findOptimalDonorMatch(requestData) {
        try {
            const {
                bloodType,
                location,
                urgency,
                quantity,
                specialRequirements,
            } = requestData;

            // Get available donors
            const potentialDonors = await User.find({
                role: "donor",
                bloodType: this.getCompatibleBloodTypes(bloodType),
                "location.coordinates": {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: location,
                        },
                        $maxDistance: 50000, // 50km radius
                    },
                },
            }).lean();

            // Generate match scores using AI
            const donorScores = await this.calculateDonorScores(
                potentialDonors,
                requestData
            );

            return donorScores;
        } catch (error) {
            throw new ApiError(
                500,
                "Failed to find optimal donor match: " + error.message
            );
        }
    }

    async predictBloodSupply(locationId) {
        try {
            const historicalData = await Blood.aggregate([
                {
                    $match: {
                        locationId: locationId,
                        createdAt: {
                            $gte: new Date(
                                Date.now() - 90 * 24 * 60 * 60 * 1000
                            ), // Last 90 days
                        },
                    },
                },
                {
                    $group: {
                        _id: {
                            bloodType: "$bloodType",
                            date: {
                                $dateToString: {
                                    format: "%Y-%m-%d",
                                    date: "$createdAt",
                                },
                            },
                        },
                        quantity: { $sum: "$quantity" },
                    },
                },
            ]);

            const prediction = await this.generateSupplyPrediction(
                historicalData
            );
            return prediction;
        } catch (error) {
            throw new ApiError(
                500,
                "Failed to predict blood supply: " + error.message
            );
        }
    }

    async optimizeEmergencyResponse(emergencyData) {
        try {
            const { location, bloodType, quantity, urgency } = emergencyData;

            // Find nearest hospitals with required blood
            const nearbyHospitals = await Hospital.find({
                "inventory.bloodType": bloodType,
                "inventory.quantity": { $gte: quantity },
                "location.coordinates": {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: location,
                        },
                    },
                },
            })
                .limit(5)
                .lean();

            const responseStrategy = await this.calculateOptimalRoute(
                nearbyHospitals,
                emergencyData
            );

            return responseStrategy;
        } catch (error) {
            throw new ApiError(
                500,
                "Failed to optimize emergency response: " + error.message
            );
        }
    }

    async analyzeDonorRetention(donorId) {
        try {
            const donorData = await User.findById(donorId)
                .select("donationHistory feedback communications")
                .lean();

            const retentionAnalysis = await this.generateRetentionInsights(
                donorData
            );
            return retentionAnalysis;
        } catch (error) {
            throw new ApiError(
                500,
                "Failed to analyze donor retention: " + error.message
            );
        }
    }

    // Helper Methods
    async calculateDonorScores(donors, requirements) {
        const prompt = this.buildDonorMatchingPrompt(donors, requirements);
        const response = await this.openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "system", prompt }],
            temperature: 0.5,
        });

        return this.parseDonorScores(response.choices[0].message.content);
    }

    getCompatibleBloodTypes(requestedType) {
        const compatibility = {
            "A+": ["A+", "A-", "O+", "O-"],
            "A-": ["A-", "O-"],
            "B+": ["B+", "B-", "O+", "O-"],
            "B-": ["B-", "O-"],
            "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
            "AB-": ["A-", "B-", "AB-", "O-"],
            "O+": ["O+", "O-"],
            "O-": ["O-"],
        };
        return compatibility[requestedType] || [];
    }
}

export default new AiService();
