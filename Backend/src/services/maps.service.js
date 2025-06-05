import { Client, PlaceType2 } from "@googlemaps/google-maps-services-js";
import { ApiError } from "../utils/ApiError.js";
import NodeCache from "node-cache";

const METERS_PER_KILOMETER = 1000;
const MAX_RADIUS_KM = 50;
const CACHE_TTL_SECONDS = 3600; // 1 hour caching

class MapsService {
    constructor() {
        this.client = new Client({});
        this.apiKey = process.env.GOOGLE_MAPS_API_KEY;
        this.cache = new NodeCache({ stdTTL: CACHE_TTL_SECONDS });
    }

    /**
     * Validate [longitude, latitude] coordinates with range checks
     * @param {number[]} coords - [longitude, latitude] pair
     * @param {string} label - Identifier for error messages
     */
    validateCoordinates(coords, label = "Coordinates") {
        if (!Array.isArray(coords) || coords.length !== 2) {
            throw new ApiError(400, `${label} must be [longitude, latitude]`);
        }
        
        const [lng, lat] = coords;
        if (typeof lng !== 'number' || typeof lat !== 'number') {
            throw new ApiError(400, `${label} must contain numbers`);
        }
        
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            throw new ApiError(400, `Invalid ${label} range (lat: -90 to 90, lng: -180 to 180)`);
        }
    }

    /**
     * Format location for Google API requests
     * @param {number[]} coords - [longitude, latitude]
     * @returns {string} Formatted "lat,lng" string
     */
    formatLocation(coords) {
        this.validateCoordinates(coords);
        return `${coords[1]},${coords[0]}`;
    }

    /**
     * Find nearby blood donation centers with enhanced filtering
     * @param {number[]} coords - [longitude, latitude]
     * @param {number} radius - Search radius in kilometers (max 50km)
     * @returns {Promise<Object[]>} List of donation centers
     */
    async findNearestCenters([lng, lat], radius = 10) {
        this.validateCoordinates([lng, lat], "Center Location");
        
        if (radius <= 0 || radius > MAX_RADIUS_KM) {
            throw new ApiError(400, `Radius must be between 1-${MAX_RADIUS_KM} km`);
        }

        const cacheKey = `centers_${lat}_${lng}_${radius}`;
        const cached = this.cache.get(cacheKey);
        if (cached) return cached;

        try {
            const response = await this.client.placesNearby({
                params: {
                    location: { lat, lng },
                    radius: Math.min(radius, MAX_RADIUS_KM) * METERS_PER_KILOMETER,
                    type: PlaceType2.health,  // Use enum for type safety
                    keyword: "blood donation OR blood bank",
                    rankby: "prominence",
                    key: this.apiKey,
                },
            });

            const results = response.data.results.map(place => ({
                id: place.place_id,
                name: place.name,
                address: place.vicinity,
                location: place.geometry.location,
                rating: place.rating ?? null,
                userRatingsTotal: place.user_ratings_total ?? null,
                isOpen: place?.opening_hours?.open_now ?? null,
                types: place.types,
                businessStatus: place.business_status,
            }));

            this.cache.set(cacheKey, results);
            return results;
        } catch (error) {
            const status = error.response?.status || 500;
            const message = error.response?.data?.error_message || error.message;
            throw new ApiError(status, `Nearby search failed: ${message}`);
        }
    }

    /**
     * Get detailed directions with multiple travel modes
     * @param {number[]} origin - [longitude, latitude]
     * @param {number[]} destination - [longitude, latitude]
     * @param {string} mode - Travel mode (driving, walking, bicycling, transit)
     * @returns {Promise<Object>} Route details
     */
    async calculateRoute(origin, destination, mode = "driving") {
        this.validateCoordinates(origin, "Origin");
        this.validateCoordinates(destination, "Destination");
        
        const validModes = ["driving", "walking", "bicycling", "transit"];
        if (!validModes.includes(mode)) {
            throw new ApiError(400, `Invalid travel mode. Use: ${validModes.join(", ")}`);
        }

        const cacheKey = `route_${this.formatLocation(origin)}_${this.formatLocation(destination)}_${mode}`;
        const cached = this.cache.get(cacheKey);
        if (cached) return cached;

        try {
            const response = await this.client.directions({
                params: {
                    origin: this.formatLocation(origin),
                    destination: this.formatLocation(destination),
                    mode,
                    alternatives: true,
                    key: this.apiKey,
                },
            });

            if (!response.data.routes.length) {
                throw new ApiError(404, "No routes found");
            }

            // Return all route options with summary
            const routes = response.data.routes.map((route, index) => {
                const leg = route.legs[0];
                return {
                    summary: route.summary,
                    distance: leg.distance,
                    duration: leg.duration,
                    steps: leg.steps.map(step => ({
                        instruction: step.html_instructions.replace(/<[^>]*>/g, ""),
                        distance: step.distance,
                        duration: step.duration,
                        coordinates: step.polyline.points,
                        travelMode: step.travel_mode,
                    })),
                    warnings: route.warnings,
                };
            });

            this.cache.set(cacheKey, routes);
            return routes;
        } catch (error) {
            const status = error.response?.status || 500;
            const message = error.response?.data?.error_message || error.message;
            throw new ApiError(status, `Route calculation failed: ${message}`);
        }
    }

    /**
     * Batch geocode multiple addresses
     * @param {string[]} addresses - List of addresses to geocode
     * @returns {Promise<Object[]>} Geocoding results
     */
    async batchGeocode(addresses) {
        if (!Array.isArray(addresses)) {
            throw new ApiError(400, "Addresses must be an array");
        }

        if (addresses.length === 0) {
            return [];
        }

        // Check cache for existing results
        const cachedResults = addresses.map(address => 
            this.cache.get(`geo_${address}`) || null
        );
        
        if (cachedResults.every(Boolean)) {
            return cachedResults;
        }

        try {
            const results = await Promise.all(addresses.map(async (address, index) => {
                if (cachedResults[index]) return cachedResults[index];
                
                const response = await this.client.geocode({
                    params: { address, key: this.apiKey },
                });

                const result = response.data.results?.[0];
                if (!result) return null;

                const location = result.geometry.location;
                const geoData = {
                    coordinates: [location.lng, location.lat],
                    formattedAddress: result.formatted_address,
                    placeId: result.place_id,
                    locationTypes: result.types,
                };

                this.cache.set(`geo_${address}`, geoData);
                return geoData;
            }));

            return results;
        } catch (error) {
            const status = error.response?.status || 500;
            const message = error.response?.data?.error_message || error.message;
            throw new ApiError(status, `Geocoding failed: ${message}`);
        }
    }

    /**
     * Get place details by place ID
     * @param {string} placeId - Google Places ID
     * @returns {Promise<Object>} Detailed place information
     */
    async getPlaceDetails(placeId) {
        if (!placeId || typeof placeId !== "string") {
            throw new ApiError(400, "Valid place ID required");
        }

        const cacheKey = `place_${placeId}`;
        const cached = this.cache.get(cacheKey);
        if (cached) return cached;

        try {
            const response = await this.client.placeDetails({
                params: {
                    place_id: placeId,
                    fields: [
                        "name", "formatted_address", "geometry", 
                        "opening_hours", "website", "formatted_phone_number",
                        "rating", "user_ratings_total"
                    ],
                    key: this.apiKey,
                },
            });

            const result = response.data.result;
            if (!result) {
                throw new ApiError(404, "Place not found");
            }

            const details = {
                name: result.name,
                address: result.formatted_address,
                location: result.geometry.location,
                openingHours: result.opening_hours?.weekday_text || [],
                phone: result.formatted_phone_number,
                website: result.website,
                rating: result.rating,
                userRatingsTotal: result.user_ratings_total,
            };

            this.cache.set(cacheKey, details);
            return details;
        } catch (error) {
            const status = error.response?.status || 500;
            const message = error.response?.data?.error_message || error.message;
            throw new ApiError(status, `Place details failed: ${message}`);
        }
    }
}

export default new MapsService();