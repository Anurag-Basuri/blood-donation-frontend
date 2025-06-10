import { Router } from "express";
import { validateRequest } from "../../middleware/validator.middleware.js";
import { verifyJWT } from "../../middleware/auth.middleware.js";
import { rateLimiter } from "../../middleware/rateLimit.middleware.js";
import {
    findNearestCenters,
    getDirections,
    geocodeAddresses,
    getPlaceDetails,
    getRecentSearches,
    clearRecentSearches,
} from "../../controllers/others/map.controller.js";

const router = Router();

// Public routes with rate limiting
router.get(
    "/centers",
    rateLimiter({
        windowMs: 1 * 60 * 1000, // 1 minute
        max: 15, // 15 requests per minute
    }),
    validateRequest("map.findCenters"),
    findNearestCenters
);

router.get(
    "/directions",
    rateLimiter({
        windowMs: 1 * 60 * 1000,
        max: 20,
    }),
    validateRequest("map.directions"),
    getDirections
);

router.post(
    "/geocode",
    rateLimiter({
        windowMs: 1 * 60 * 1000,
        max: 10,
    }),
    validateRequest("map.geocode"),
    geocodeAddresses
);

router.get(
    "/places/:placeId",
    rateLimiter({
        windowMs: 1 * 60 * 1000,
        max: 30,
    }),
    validateRequest("map.placeDetails"),
    getPlaceDetails
);

// Protected routes
router.use(verifyJWT);

router.get(
    "/recent-searches",
    validateRequest("map.recentSearches"),
    getRecentSearches
);

router.delete(
    "/recent-searches",
    validateRequest("map.clearSearches"),
    clearRecentSearches
);

// Error handler
router.use((err, req, res, next) => {
    console.error("Map Service Error:", err);
    if (err.name === "ValidationError") {
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }
    next(err);
});

export default router;
