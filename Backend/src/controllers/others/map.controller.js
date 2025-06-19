import mapsService from '../../services/maps.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { Activity } from '../../models/others/activity.model.js';

/**
 * Map Controller for handling location-based operations
 */
class MapController {
	// Find nearby blood donation centers
	static findNearestCenters = asyncHandler(async (req, res) => {
		const { longitude, latitude, radius = 10 } = req.query;

		if (!longitude || !latitude) {
			throw new ApiError(400, 'Longitude and latitude are required');
		}

		const centers = await mapsService.findNearestCenters(
			[parseFloat(longitude), parseFloat(latitude)],
			parseFloat(radius),
		);

		// Log search activity
		await Activity.create({
			type: 'LOCATION_SEARCH',
			performedBy: {
				userId: req.user?._id,
				userModel: req.user?.role || 'Guest',
			},
			details: {
				coordinates: [longitude, latitude],
				radius,
				resultsCount: centers.length,
			},
		});

		return res
			.status(200)
			.json(new ApiResponse(200, { centers }, 'Nearby centers fetched successfully'));
	});

	// Get route directions
	static getDirections = asyncHandler(async (req, res) => {
		const { originLng, originLat, destLng, destLat, mode = 'driving' } = req.query;

		if (!originLng || !originLat || !destLng || !destLat) {
			throw new ApiError(400, 'Origin and destination coordinates required');
		}

		const routes = await mapsService.calculateRoute(
			[parseFloat(originLng), parseFloat(originLat)],
			[parseFloat(destLng), parseFloat(destLat)],
			mode,
		);

		return res
			.status(200)
			.json(new ApiResponse(200, { routes }, 'Route calculated successfully'));
	});

	// Batch geocode addresses
	static geocodeAddresses = asyncHandler(async (req, res) => {
		const { addresses } = req.body;

		if (!Array.isArray(addresses) || addresses.length === 0) {
			throw new ApiError(400, 'Valid addresses array required');
		}

		if (addresses.length > 50) {
			throw new ApiError(400, 'Maximum 50 addresses allowed per request');
		}

		const results = await mapsService.batchGeocode(addresses);

		return res.status(200).json(
			new ApiResponse(
				200,
				{
					results,
					summary: {
						total: addresses.length,
						successful: results.filter(Boolean).length,
						failed: results.filter(r => !r).length,
					},
				},
				'Addresses geocoded successfully',
			),
		);
	});

	// Get place details
	static getPlaceDetails = asyncHandler(async (req, res) => {
		const { placeId } = req.params;

		const details = await mapsService.getPlaceDetails(placeId);

		// Cache the result in user's recent searches if authenticated
		if (req.user) {
			await this.updateRecentSearches(req.user._id, {
				placeId,
				name: details.name,
				timestamp: new Date(),
			});
		}

		return res
			.status(200)
			.json(new ApiResponse(200, { details }, 'Place details fetched successfully'));
	});

	// Get user's recent searches
	static getRecentSearches = asyncHandler(async (req, res) => {
		if (!req.user) {
			throw new ApiError(401, 'Authentication required');
		}

		const recentSearches = await Activity.find({
			'performedBy.userId': req.user._id,
			type: 'LOCATION_SEARCH',
		})
			.sort({ createdAt: -1 })
			.limit(10);

		return res.status(200).json(
			new ApiResponse(
				200,
				{
					recentSearches,
				},
				'Recent searches fetched successfully',
			),
		);
	});

	// Clear recent searches
	static clearRecentSearches = asyncHandler(async (req, res) => {
		if (!req.user) {
			throw new ApiError(401, 'Authentication required');
		}

		await Activity.deleteMany({
			'performedBy.userId': req.user._id,
			type: 'LOCATION_SEARCH',
		});

		return res
			.status(200)
			.json(new ApiResponse(200, null, 'Recent searches cleared successfully'));
	});

	// Private helper method
	static async updateRecentSearches(userId, searchData) {
		const maxSearches = 10;

		await Activity.create({
			type: 'PLACE_SEARCH',
			performedBy: {
				userId,
				userModel: 'User',
			},
			details: searchData,
		});

		// Clean up old searches if needed
		const searchCount = await Activity.countDocuments({
			'performedBy.userId': userId,
			type: 'PLACE_SEARCH',
		});

		if (searchCount > maxSearches) {
			const oldestSearches = await Activity.find({
				'performedBy.userId': userId,
				type: 'PLACE_SEARCH',
			})
				.sort({ createdAt: 1 })
				.limit(searchCount - maxSearches);

			await Activity.deleteMany({
				_id: { $in: oldestSearches.map(s => s._id) },
			});
		}
	}
}

export const {
	findNearestCenters,
	getDirections,
	geocodeAddresses,
	getPlaceDetails,
	getRecentSearches,
	clearRecentSearches,
} = MapController;
