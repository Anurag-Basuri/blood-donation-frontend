import { Facility, DonationCenter, DonationCamp, FACILITY_TYPE, FACILITY_STATUS } from '../../models/donation/facility.models.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

// Create a new facility (center or camp)
const createFacility = asyncHandler(async (req, res) => {
    const {
        facilityType,
        name,
        ngoId,
        contactInfo,
        schedule,
        bloodInventory,
        facilities,
        license,
    } = req.body;

    if (!facilityType || !Object.values(FACILITY_TYPE).includes(facilityType)) {
        throw new ApiError(400, 'Invalid or missing facility type');
    }
    if (!name || !ngoId || !contactInfo) {
        throw new ApiError(400, 'Name, NGO, and contact info are required');
    }

    const Model = facilityType === FACILITY_TYPE.CENTER ? DonationCenter : DonationCamp;
    const facility = await Model.create({
        facilityType,
        name,
        ngoId,
        contactInfo,
        schedule,
        bloodInventory,
        facilities,
        license,
    });

    return res.status(201).json(new ApiResponse(201, facility, 'Facility created successfully'));
});

// Get all facilities (with pagination and optional filters)
const getAllFacilities = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, type, status, city } = req.query;
    const filter = {};

    if (type && Object.values(FACILITY_TYPE).includes(type)) {
        filter.facilityType = type;
    }
    if (status && Object.values(FACILITY_STATUS).includes(status)) {
        filter.status = status;
    }
    if (city) {
        filter['contactInfo.address.city'] = { $regex: city, $options: 'i' };
    }

    const total = await Facility.countDocuments(filter);
    const facilities = await Facility.find(filter)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, {
            total,
            count: facilities.length,
            page: Number(page),
            limit: Number(limit),
            facilities,
        }, 'Facilities fetched successfully')
    );
});

// Get a single facility by ID
const getFacilityById = asyncHandler(async (req, res) => {
    const { facilityId } = req.params;
    const facility = await Facility.findById(facilityId);

    if (!facility) throw new ApiError(404, 'Facility not found');

    return res.status(200).json(new ApiResponse(200, facility, 'Facility details fetched'));
});

// Update a facility
const updateFacility = asyncHandler(async (req, res) => {
    const { facilityId } = req.params;
    const updates = req.body;

    const facility = await Facility.findByIdAndUpdate(facilityId, updates, {
        new: true,
        runValidators: true,
    });

    if (!facility) throw new ApiError(404, 'Facility not found');

    return res.status(200).json(new ApiResponse(200, facility, 'Facility updated successfully'));
});

// Delete a facility
const deleteFacility = asyncHandler(async (req, res) => {
    const { facilityId } = req.params;
    const facility = await Facility.findByIdAndDelete(facilityId);

    if (!facility) throw new ApiError(404, 'Facility not found');

    return res.status(200).json(new ApiResponse(200, null, 'Facility deleted successfully'));
});

// Find nearby facilities
const findNearbyFacilities = asyncHandler(async (req, res) => {
    const { lng, lat, radius = 10000, type } = req.query;
    if (!lng || !lat) throw new ApiError(400, 'Longitude and latitude are required');

    const coordinates = [parseFloat(lng), parseFloat(lat)];
    const facilities = await Facility.findNearby(coordinates, Number(radius), type);

    return res.status(200).json(new ApiResponse(200, facilities, 'Nearby facilities fetched'));
});

export {
    createFacility,
    getAllFacilities,
    getFacilityById,
    updateFacility,
    deleteFacility,
    findNearbyFacilities
};