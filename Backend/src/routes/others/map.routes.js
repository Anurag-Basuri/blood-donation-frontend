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

// 🔐 Protected routes for authenticated users
router.use(verifyJWT);

// 📍 Find nearest donation centers (based on user location)
router.get('/nearest-centers', findNearestCenters);

// 🗺️ Get directions between two locations
router.get('/directions', getDirections);

// 🧭 Geocode an address to get lat/lng
router.get('/geocode', geocodeAddresses);

// 🏥 Get details of a place (e.g., a hospital or NGO center)
router.get('/place-details', getPlaceDetails);

// 📜 Get recently searched locations
router.get('/recent-searches', getRecentSearches);

// ❌ Clear recent searches
router.delete('/recent-searches', clearRecentSearches);

export default router;
