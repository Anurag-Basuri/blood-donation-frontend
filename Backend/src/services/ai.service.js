import OpenAI from "openai";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/users/user.models.js";

class AiService {
    constructor() {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error("OpenAI API key is required");
        }
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
        this.MODEL = "gpt-4-1106-preview";
    }

    // 1. Donor Matching with Enhanced Features
    async findOptimalDonorMatch(requestData) {
        try {
            const {
                bloodType,
                location,
                urgency,
                quantity,
                specialRequirements,
            } = requestData;

            // Validate inputs
            if (!bloodType || !location || !quantity) {
                throw new ApiError(400, "Missing required parameters");
            }

            const compatibleTypes = this.getCompatibleBloodTypes(bloodType);
            const searchRadius = this.calculateSearchRadius(urgency);

            const potentialDonors = await User.find({
                donorStatus: "Active",
                bloodType: { $in: compatibleTypes },
                nextEligibleDate: { $lte: new Date() },
                "address.location": {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: location,
                        },
                        $maxDistance: searchRadius,
                    },
                },
            })
                .select(
                    "bloodType address.location lastDonationDate donationHistory medicalInfo"
                )
                .lean();

            if (!potentialDonors.length) {
                return {
                    donors: [],
                    message: "No eligible donors found in the specified area",
                };
            }

            const donorScores = await this.calculateDonorScores(
                potentialDonors,
                requestData
            );
            return {
                donors: donorScores,
                searchRadius,
                totalFound: donorScores.length,
            };
        } catch (error) {
            throw new ApiError(
                error.statusCode || 500,
                `Donor matching failed: ${error.message}`
            );
        }
    }

    // 2. Enhanced Blood Supply Prediction
    async predictBloodSupply(locationId, timeframe = 30) {
        try {
            const historicalRange = timeframe * 3; // Analysis period 3x the prediction timeframe
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - historicalRange);

            const [donationData, usageData] = await Promise.all([
                this.getDonationHistory(locationId, startDate),
                this.getUsageHistory(locationId, startDate),
            ]);

            const prompt = this.buildSupplyPredictionPrompt({
                donationData,
                usageData,
                timeframe,
                seasonality: this.getSeasonalityFactors(),
            });

            const prediction = await this.generateAIPrediction(prompt);
            return this.processPredictionResponse(prediction);
        } catch (error) {
            throw new ApiError(
                error.statusCode || 500,
                `Supply prediction failed: ${error.message}`
            );
        }
    }

    // 3. Emergency Response Optimization
    async optimizeEmergencyResponse(emergencyData) {
        try {
            const { location, bloodType, quantity, urgencyLevel } =
                emergencyData;

            // Find both hospitals and NGOs with available blood
            const [hospitals, ngos] = await Promise.all([
                this.findNearbyHospitals(location, bloodType, quantity),
                this.findNearbyNGOs(location, bloodType, quantity),
            ]);

            const allSources = [...hospitals, ...ngos].map((source) => ({
                ...source,
                distance: this.calculateDistance(
                    location,
                    source.address.location.coordinates
                ),
                estimatedTime: this.calculateTravelTime(
                    location,
                    source.address.location.coordinates
                ),
            }));

            // Generate optimal route and strategy
            const strategy = await this.generateEmergencyStrategy(
                allSources,
                emergencyData
            );

            return {
                strategy,
                availableSources: allSources.length,
                estimatedResponse: strategy.estimatedTime,
            };
        } catch (error) {
            throw new ApiError(
                error.statusCode || 500,
                `Emergency response optimization failed: ${error.message}`
            );
        }
    }

    // Helper Methods
    calculateSearchRadius(urgency) {
        const baseRadius = 10000; // 10km
        const radiusMultipliers = {
            CRITICAL: 5, // 50km
            HIGH: 3, // 30km
            MEDIUM: 2, // 20km
            LOW: 1, // 10km
        };
        return baseRadius * (radiusMultipliers[urgency] || 1);
    }

    getSeasonalityFactors() {
        const currentMonth = new Date().getMonth();
        return {
            isHolidaySeason: [11, 0].includes(currentMonth), // December, January
            isSummerVacation: [5, 6, 7].includes(currentMonth), // June, July, August
            isRainySeason: [6, 7, 8].includes(currentMonth), // Monsoon months
        };
    }

    async generateAIPrediction(prompt) {
        try {
            const response = await this.openai.chat.completions.create({
                model: this.MODEL,
                messages: [{ role: "user", content: prompt }],
                temperature: 0.4,
                max_tokens: 1000,
                response_format: { type: "json_object" },
            });
            return JSON.parse(response.choices[0].message.content);
        } catch (error) {
            throw new ApiError(500, "AI prediction generation failed");
        }
    }

    buildSupplyPredictionPrompt(data) {
        return `
            Analyze the following blood donation data and provide a prediction:
            Historical Donations: ${JSON.stringify(data.donationData)}
            Usage History: ${JSON.stringify(data.usageData)}
            Timeframe: ${data.timeframe} days
            Seasonality Factors: ${JSON.stringify(data.seasonality)}
            
            Provide predictions for:
            1. Expected donation volume
            2. Expected usage
            3. Potential shortages
            4. Recommended actions
            
            Format response as JSON.
        `.trim();
    }
}

export default new AiService();
