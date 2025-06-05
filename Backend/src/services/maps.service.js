import { Client } from "@googlemaps/google-maps-services-js";
import { ApiError } from "../utils/ApiError.js";

const METERS_PER_KILOMETER = 1000;

class MapsService {
    constructor() {
        this.client = new Client({});
        this.apiKey = process.env.GOOGLE_MAPS_API_KEY;
    }

    /**
     * Validate [longitude, latitude] coordinates
     */
    validateCoordinates(coords, label = "Coordinates") {
        if (!Array.isArray(coords) || coords.length !== 2) {
            throw new ApiError(400, `${label} must be [longitude, latitude]`);
        }
    }

    /**
     * Find nearby blood donation centers using Google Places API
     */
    async findNearestCenters([lng, lat], radius = 10) {
        this.validateCoordinates([lng, lat], "Center Location");

        try {
            const response = await this.client.placesNearby({
                params: {
                    location: { lat, lng },
                    radius: radius * METERS_PER_KILOMETER,
                    type: ["hospital", "health"],
                    keyword: "blood donation",
                    key: this.apiKey,
                },
            });

            return response.data.results.map((place) => ({
                id: place.place_id,
                name: place.name,
                address: place.vicinity,
                location: place.geometry.location,
                rating: place.rating ?? "N/A",
                isOpen: place?.opening_hours?.open_now ?? null,
            }));
        } catch (error) {
            throw new ApiError(500, `Nearby search failed: ${error.message}`);
        }
    }

    /**
     * Get directions between two coordinates
     */
    async calculateRoute(origin, destination) {
        this.validateCoordinates(origin, "Origin");
        this.validateCoordinates(destination, "Destination");

        try {
            const response = await this.client.directions({
                params: {
                    origin: `${origin[1]},${origin[0]}`,
                    destination: `${destination[1]},${destination[0]}`,
                    mode: "driving",
                    key: this.apiKey,
                },
            });

            const route = response.data.routes?.[0];
            if (!route) {
                throw new ApiError(404, "No route found");
            }

            const leg = route.legs[0];
            return {
                distance: leg.distance.text,
                duration: leg.duration.text,
                steps: leg.steps.map((step) => ({
                    instruction: step.html_instructions,
                    distance: step.distance.text,
                    duration: step.duration.text,
                })),
            };
        } catch (error) {
            throw new ApiError(
                500,
                `Route calculation failed: ${error.message}`
            );
        }
    }

    /**
     * Convert address into [lng, lat] coordinates using Geocoding
     */
    async geocodeAddress(address) {
        if (!address) {
            throw new ApiError(400, "Address is required");
        }

        try {
            const response = await this.client.geocode({
                params: { address, key: this.apiKey },
            });

            const result = response.data.results?.[0];
            if (!result) {
                throw new ApiError(404, "Address not found");
            }

            const location = result.geometry.location;

            return {
                coordinates: [location.lng, location.lat],
                formattedAddress: result.formatted_address,
                placeId: result.place_id,
            };
        } catch (error) {
            throw new ApiError(500, `Geocoding failed: ${error.message}`);
        }
    }

    /**
     * Find optimized driving route with multiple waypoints
     */
    async optimizeRoute(origin, destinations) {
        this.validateCoordinates(origin, "Origin");

        if (!Array.isArray(destinations) || destinations.length === 0) {
            throw new ApiError(400, "At least one destination is required");
        }

        const waypoints = destinations.map((dest, index) => {
            this.validateCoordinates(dest, `Destination ${index + 1}`);
            return {
                location: `${dest[1]},${dest[0]}`,
                stopover: true,
            };
        });

        try {
            const response = await this.client.directions({
                params: {
                    origin: `${origin[1]},${origin[0]}`,
                    destination: `${origin[1]},${origin[0]}`,
                    waypoints,
                    optimizeWaypoints: true,
                    mode: "driving",
                    key: this.apiKey,
                },
            });

            const route = response.data.routes?.[0];
            if (!route) {
                throw new ApiError(404, "Optimized route not found");
            }

            const totalDistance = route.legs.reduce(
                (sum, leg) => sum + leg.distance.value,
                0
            );
            const totalDuration = route.legs.reduce(
                (sum, leg) => sum + leg.duration.value,
                0
            );

            return {
                optimizedOrder: route.waypoint_order,
                totalDistanceMeters: totalDistance,
                totalDurationSeconds: totalDuration,
                summary: route.summary,
                route,
            };
        } catch (error) {
            throw new ApiError(
                500,
                `Route optimization failed: ${error.message}`
            );
        }
    }
}

export default new MapsService();
