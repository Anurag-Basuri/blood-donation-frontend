import mapsService from '../../services/maps.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { Activity } from '../../models/others/activity.model.js';

class MapController {
	static parseFloatParam(value, name) {
		const num = parseFloat(value);
		if (isNaN(num)) throw new ApiError(400, `Invalid ${name}`);
		return num;
	}

	static validateUser(req) {
		if (!req.user) throw new ApiError(401, 'Authentication required');
	}

	// Finds nearby centers based on provided coordinates and radius
	static findNearestCenters = asyncHandler(async (req, res) => {
		const { longitude, latitude, radius = 10 } = req.query;

		if (!longitude || !latitude) {
			throw new ApiError(400, 'Both longitude and latitude are required');
		}

		const lng = this.parseFloatParam(longitude, 'longitude');
		const lat = this.parseFloatParam(latitude, 'latitude');
		const rad = this.parseFloatParam(radius, 'radius');

		const centers = await mapsService.findNearestCenters([lng, lat], rad);

		await Activity.create({
			type: 'LOCATION_SEARCH',
			performedBy: {
				userId: req.user?._id,
				userModel: req.user?.role || 'Guest',
			},
			details: {
				coordinates: [longitude, latitude],
				radius: rad,
				resultsCount: centers.length,
			},
		});

		res.status(200).json(
			new ApiResponse(200, { centers }, 'Nearby centers fetched successfully'),
		);
	});

	// Calculates directions between two points
	static getDirections = asyncHandler(async (req, res) => {
		const { originLng, originLat, destLng, destLat, mode = 'driving' } = req.query;

		if (!originLng || !originLat || !destLng || !destLat) {
			throw new ApiError(400, 'All origin and destination coordinates are required');
		}

		const origin = [
			this.parseFloatParam(originLng, 'originLng'),
			this.parseFloatParam(originLat, 'originLat'),
		];
		const destination = [
			this.parseFloatParam(destLng, 'destLng'),
			this.parseFloatParam(destLat, 'destLat'),
		];

		const routes = await mapsService.calculateRoute(origin, destination, mode);

		res.status(200).json(new ApiResponse(200, { routes }, 'Route calculated successfully'));
	});

	// Geocodes multiple addresses in a single request
	static geocodeAddresses = asyncHandler(async (req, res) => {
		const { addresses } = req.body;

		if (!Array.isArray(addresses) || addresses.length === 0) {
			throw new ApiError(400, 'Addresses must be a non-empty array');
		}

		if (addresses.length > 50) {
			throw new ApiError(400, 'Maximum 50 addresses allowed');
		}

		const results = await mapsService.batchGeocode(addresses);

		res.status(200).json(
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

	// Fetches details for a specific place by ID
	static getPlaceDetails = asyncHandler(async (req, res) => {
		const { placeId } = req.params;

		if (!placeId) {
			throw new ApiError(400, 'Place ID is required');
		}

		const details = await mapsService.getPlaceDetails(placeId);

		if (req.user) {
			await this.updateRecentSearches(req.user._id, {
				placeId,
				name: details.name,
				timestamp: new Date(),
			});
		}

		res.status(200).json(
			new ApiResponse(200, { details }, 'Place details fetched successfully'),
		);
	});

	// Fetches recent searches made by the user
	static getRecentSearches = asyncHandler(async (req, res) => {
		this.validateUser(req);

		const recentSearches = await Activity.find({
			'performedBy.userId': req.user._id,
			type: 'LOCATION_SEARCH',
		})
			.sort({ createdAt: -1 })
			.limit(10);

		res.status(200).json(
			new ApiResponse(200, { recentSearches }, 'Recent searches fetched successfully'),
		);
	});

	// Clears recent searches for the authenticated user
	static clearRecentSearches = asyncHandler(async (req, res) => {
		this.validateUser(req);

		await Activity.deleteMany({
			'performedBy.userId': req.user._id,
			type: 'LOCATION_SEARCH',
		});

		res.status(200).json(new ApiResponse(200, null, 'Recent searches cleared successfully'));
	});

	// Updates recent searches with new search data
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

		const excess = await Activity.find({
			'performedBy.userId': userId,
			type: 'PLACE_SEARCH',
		})
			.sort({ createdAt: 1 })
			.skip(maxSearches);

		if (excess.length) {
			await Activity.deleteMany({ _id: { $in: excess.map(e => e._id) } });
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
