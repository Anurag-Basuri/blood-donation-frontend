import { Client } from "@googlemaps/google-maps-services-js";
import { ApiError } from "../utils/ApiError.js";

class MapsService {
    constructor() {
        this.client = new Client({});
        this.apiKey = process.env.GOOGLE_MAPS_API_KEY;
    }

    /**
     * Find nearest blood donation centers
     * @param {Array} coordinates [longitude, latitude]
     * @param {number} radius Distance in kilometers
     */
    async findNearestCenters(coordinates, radius = 10) {
        try {
            const [longitude, latitude] = coordinates;

            const response = await this.client.placesNearby({
                params: {
                    location: { lat: latitude, lng: longitude },
                    radius: radius * 1000, // Convert to meters
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
                rating: place.rating,
                isOpen: place?.opening_hours?.open_now,
            }));
        } catch (error) {
            throw new ApiError(
                500,
                `Failed to find nearby centers: ${error.message}`
            );
        }
    }

    /**
     * Calculate distance and duration between points
     * @param {Array} origin Starting coordinates [longitude, latitude]
     * @param {Array} destination Ending coordinates [longitude, latitude]
     */
    async calculateRoute(origin, destination) {
        try {
            const response = await this.client.directions({
                params: {
                    origin: `${origin[1]},${origin[0]}`,
                    destination: `${destination[1]},${destination[0]}`,
                    mode: "driving",
                    key: this.apiKey,
                },
            });

            const route = response.data.routes[0];
            return {
                distance: route.legs[0].distance.text,
                duration: route.legs[0].duration.text,
                steps: route.legs[0].steps.map((step) => ({
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
     * Geocode an address to coordinates
     * @param {string} address Full address string
     */
    async geocodeAddress(address) {
        try {
            const response = await this.client.geocode({
                params: {
                    address,
                    key: this.apiKey,
                },
            });

            if (!response.data.results.length) {
                throw new ApiError(404, "Address not found");
            }

            const location = response.data.results[0].geometry.location;
            return {
                coordinates: [location.lng, location.lat],
                formattedAddress: response.data.results[0].formatted_address,
                placeId: response.data.results[0].place_id,
            };
        } catch (error) {
            throw new ApiError(500, `Geocoding failed: ${error.message}`);
        }
    }

    /**
     * Optimize route for multiple stops
     * @param {Array} origin Starting point coordinates
     * @param {Array} destinations Array of destination coordinates
     */
    async optimizeRoute(origin, destinations) {
        try {
            const response = await this.client.directions({
                params: {
                    origin: `${origin[1]},${origin[0]}`,
                    destination: `${origin[1]},${origin[0]}`, // Return to origin
                    waypoints: destinations.map((dest) => ({
                        location: `${dest[1]},${dest[0]}`,
                        stopover: true,
                    })),
                    optimize: true,
                    mode: "driving",
                    key: this.apiKey,
                },
            });

            return {
                optimizedOrder: response.data.routes[0].waypoint_order,
                totalDistance: response.data.routes[0].legs.reduce(
                    (sum, leg) => sum + leg.distance.value,
                    0
                ),
                totalDuration: response.data.routes[0].legs.reduce(
                    (sum, leg) => sum + leg.duration.value,
                    0
                ),
                route: response.data.routes[0],
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
