import { Router } from 'express';
import { validateRequest } from '../../middleware/validator.middleware.js';
import { verifyJWT } from '../../middleware/auth.middleware.js';
import {
	findNearestCenters,
	getDirections,
	geocodeAddresses,
	getPlaceDetails,
	getRecentSearches,
	clearRecentSearches,
} from '../../controllers/others/map.controller.js';

const router = Router();

// Public routes with rate limiting
router.get('/centers', validateRequest('map.findCenters'), findNearestCenters);

router.get('/directions', validateRequest('map.directions'), getDirections);

router.post('/geocode', validateRequest('map.geocode'), geocodeAddresses);

router.get('/places/:placeId', validateRequest('map.placeDetails'), getPlaceDetails);

// Protected routes
router.use(verifyJWT);

router.get('/recent-searches', validateRequest('map.recentSearches'), getRecentSearches);

router.delete('/recent-searches', validateRequest('map.clearSearches'), clearRecentSearches);

// Error handler
router.use((err, req, res, next) => {
	console.error('Map Service Error:', err);
	if (err.name === 'ValidationError') {
		return res.status(400).json({
			success: false,
			message: err.message,
		});
	}
	next(err);
});

export default router;
