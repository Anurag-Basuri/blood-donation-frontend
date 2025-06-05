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

    // 1. Donor Matching
    async findOptimalDonorMatch(requestData) {
        try {
            const {
                bloodType,
                location,
                urgency,
                quantity,
                specialRequirements,
            } = requestData;

            const compatibleTypes = this.getCompatibleBloodTypes(bloodType);

            const potentialDonors = await User.find({
                role: "donor",
                bloodType: { $in: compatibleTypes },
                "location.coordinates": {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: location,
                        },
                        $maxDistance: 50_000, // 50 km
                    },
                },
            }).lean();

            if (!potentialDonors.length) {
                return [];
            }

            const donorScores = await this.calculateDonorScores(
                potentialDonors,
                requestData
            );
            return donorScores;
        } catch (error) {
            console.error("Error in findOptimalDonorMatch:", error);
            throw new ApiError(500, `Donor match failed: ${error.message}`);
        }
    }

    // 2. Blood Supply Prediction
    async predictBloodSupply(locationId) {
        try {
            const ninetyDaysAgo = new Date(
                Date.now() - 90 * 24 * 60 * 60 * 1000
            );

            const historicalData = await Blood.aggregate([
                {
                    $match: {
                        locationId,
                        createdAt: { $gte: ninetyDaysAgo },
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
            console.error("Error in predictBloodSupply:", error);
            throw new ApiError(
                500,
                `Supply prediction failed: ${error.message}`
            );
        }
    }

    // 3. Emergency Response
    async optimizeEmergencyResponse(data) {
        try {
            const { location, bloodType, quantity } = data;

            const hospitals = await Hospital.find({
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

            if (!hospitals.length) {
                return {
                    message: "No nearby hospitals with sufficient supply.",
                };
            }

            const strategy = await this.calculateOptimalRoute(hospitals, data);
            return strategy;
        } catch (error) {
            console.error("Error in optimizeEmergencyResponse:", error);
            throw new ApiError(
                500,
                `Emergency response optimization failed: ${error.message}`
            );
        }
    }

    // 4. Donor Retention Analysis
    async analyzeDonorRetention(donorId) {
        try {
            const donor = await User.findById(donorId)
                .select(
                    "donationHistory feedback communications campaignParticipation"
                )
                .lean();

            if (!donor) {
                throw new ApiError(404, "Donor not found.");
            }

            const insights = await this.generateRetentionInsights(donor);
            return insights;
        } catch (error) {
            console.error("Error in analyzeDonorRetention:", error);
            throw new ApiError(
                500,
                `Retention analysis failed: ${error.message}`
            );
        }
    }

    // -------------------------
    //      Helper Methods
    // -------------------------

    // Generate scores using AI
    async calculateDonorScores(donors, requirements) {
        const prompt = this.buildDonorMatchingPrompt(donors, requirements);

        const response = await this.openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.4,
        });

        return this.parseDonorScores(response.choices[0].message.content);
    }

    getCompatibleBloodTypes(requestedType) {
        const table = {
            "A+": ["A+", "A-", "O+", "O-"],
            "A-": ["A-", "O-"],
            "B+": ["B+", "B-", "O+", "O-"],
            "B-": ["B-", "O-"],
            "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
            "AB-": ["A-", "B-", "AB-", "O-"],
            "O+": ["O+", "O-"],
            "O-": ["O-"],
        };
        return table[requestedType] || [];
    }

    buildDonorMatchingPrompt(donors, requirements) {
        const donorList = donors.map((d, i) => ({
            id: d._id,
            bloodType: d.bloodType,
            location: d.location?.coordinates,
            lastDonation: d.lastDonationDate,
            distance: "to be calculated by model",
        }));

        return `
You are a medical AI assistant. Based on the following requirements:
- Blood Type: ${requirements.bloodType}
- Urgency: ${requirements.urgency}
- Quantity Needed: ${requirements.quantity}
- Location: ${requirements.location}
- Special Requirements: ${requirements.specialRequirements || "None"}

Evaluate the list of donors:
${JSON.stringify(donorList, null, 2)}

Rank them from best to least suitable with a score (0–100), estimated donation time, and reason.
Output should be a JSON array.
        `.trim();
    }

    parseDonorScores(content) {
        try {
            return JSON.parse(content);
        } catch (err) {
            console.error("Failed to parse AI response:", err);
            throw new ApiError(500, "AI response parsing failed.");
        }
    }
}

export default new AiService();
