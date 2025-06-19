import aiService from '../../services/ai.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { Activity } from '../../models/others/activity.model.js';

class AiController {
	// Find optimal donor matches
	static findDonorMatches = asyncHandler(async (req, res) => {
		const { bloodType, location, urgency, quantity, specialRequirements } = req.body;

		// Validate required fields
		if (!bloodType || !location || !quantity) {
			throw new ApiError(400, 'Missing required fields');
		}

		const matches = await aiService.findOptimalDonorMatch({
			bloodType,
			location,
			urgency: urgency || 'NORMAL',
			quantity,
			specialRequirements,
		});

		// Log AI analysis activity
		await Activity.create({
			type: 'AI_DONOR_MATCHING',
			performedBy: {
				userId: req.user._id,
				userModel: req.user.role,
			},
			details: {
				bloodType,
				quantity,
				matchesFound: matches.length,
			},
		});

		return res
			.status(200)
			.json(new ApiResponse(200, { matches }, 'Donor matches found successfully'));
	});

	// Predict blood supply
	static predictSupply = asyncHandler(async (req, res) => {
		const { locationId } = req.params;
		const { timeframe = 30 } = req.query;

		if (!locationId) {
			throw new ApiError(400, 'Location ID is required');
		}

		const prediction = await aiService.predictBloodSupply(locationId);

		return res.status(200).json(
			new ApiResponse(
				200,
				{
					prediction,
					timeframe,
					locationId,
				},
				'Supply prediction generated successfully',
			),
		);
	});

	// Optimize emergency response
	static optimizeEmergencyResponse = asyncHandler(async (req, res) => {
		const { location, bloodType, quantity, urgencyLevel } = req.body;

		// Enhanced validation for emergency
		if (!location || !bloodType || !quantity) {
			throw new ApiError(400, 'Missing critical emergency information');
		}

		const response = await aiService.optimizeEmergencyResponse({
			location,
			bloodType,
			quantity,
			urgencyLevel: urgencyLevel || 'HIGH',
		});

		// Log emergency optimization
		await Activity.create({
			type: 'EMERGENCY_OPTIMIZATION',
			performedBy: {
				userId: req.user._id,
				userModel: req.user.role,
			},
			details: {
				bloodType,
				quantity,
				urgencyLevel,
				timestamp: new Date(),
			},
		});

		return res.status(200).json(new ApiResponse(200, response, 'Emergency response optimized'));
	});

	// Analyze donor retention
	static analyzeDonorRetention = asyncHandler(async (req, res) => {
		const { donorId } = req.params;
		const { analysisDepth = 'basic' } = req.query;

		const analysis = await aiService.analyzeDonorRetention(donorId);

		// Store analysis results
		await Activity.create({
			type: 'DONOR_RETENTION_ANALYSIS',
			performedBy: {
				userId: req.user._id,
				userModel: req.user.role,
			},
			details: {
				donorId,
				analysisDepth,
				insights: analysis.summary,
			},
		});

		return res
			.status(200)
			.json(new ApiResponse(200, analysis, 'Donor retention analysis completed'));
	});

	// Get AI insights for campaigns
	static getCampaignInsights = asyncHandler(async (req, res) => {
		const { campaignId } = req.params;
		const { location, targetDemographic, historicalData } = req.body;

		const insights = await aiService.analyzeCampaignPotential({
			campaignId,
			location,
			targetDemographic,
			historicalData,
		});

		return res.status(200).json(
			new ApiResponse(
				200,
				{
					insights,
					recommendations: insights.recommendations,
					potentialReach: insights.reach,
					successProbability: insights.probability,
				},
				'Campaign insights generated successfully',
			),
		);
	});

	// Health prediction for donors
	static predictDonorHealth = asyncHandler(async (req, res) => {
		const { donorId } = req.params;
		const { includeLifestyleFactors = true } = req.query;

		const healthPrediction = await aiService.predictDonorHealth(
			donorId,
			includeLifestyleFactors,
		);

		return res.status(200).json(
			new ApiResponse(
				200,
				{
					prediction: healthPrediction,
					nextEligibleDate: healthPrediction.nextDonationDate,
					healthFactors: healthPrediction.factors,
					recommendations: healthPrediction.recommendations,
				},
				'Health prediction completed',
			),
		);
	});
}

// Export controller methods
export const {
	findDonorMatches,
	predictSupply,
	optimizeEmergencyResponse,
	analyzeDonorRetention,
	getCampaignInsights,
	predictDonorHealth,
} = AiController;
