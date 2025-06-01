import mongoose from 'mongoose';
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Center, DonationCamp, BloodBank } from "../models/center.models.js";

/**
 * Add a new center (blood bank or donation camp)
 */
const addCenter = asyncHandler(async (req, res) => {
  const {
    name,
    type,
    description,
    contactPerson,
    location,
    timing,
    facilities,
    targetBloodGroups,
    staff,
    // Fields specific to donation camps
    campaignName,
    targetDonations,
    eventPartners,
    registrationDeadline,
    // Fields specific to blood banks
    licenseNumber,
    licenseExpiry,
    storageCapacity,
    certifications,
    equipments,
    status
  } = req.body;

  // Validate required fields
  if (!name || !type || !location?.city || !location?.pinCode) {
    throw new ApiError(400, "Name, type, and location details are required");
  }

  // Create base center data
  const centerData = {
    name,
    type,
    description,
    ngoId: req.ngo._id, // From JWT auth
    status,
    contactPerson,
    location,
    timing,
    facilities,
    targetBloodGroups,
    staff: staff || []
  };

  let center;

  // Create specific type of center
  if (type === 'DonationCamp') {
    if (!campaignName || !targetDonations || !registrationDeadline) {
      throw new ApiError(400, "Campaign name, target donations, and registration deadline are required for donation camps");
    }

    // Parse and validate eventPartners
    let parsedEventPartners = Array.isArray(eventPartners) ? eventPartners : [];
    if (typeof eventPartners === 'string') {
      try {
        parsedEventPartners = JSON.parse(eventPartners);
        if (!Array.isArray(parsedEventPartners)) {
          throw new Error("Event partners must be an array");
        }
      } catch (error) {
        throw new ApiError(400, "Invalid event partners format. Must be an array of partner objects");
      }
    }

    // Validate each partner object
    parsedEventPartners.forEach((partner, index) => {
      if (!partner.name || !partner.type || !partner.contributionType) {
        throw new ApiError(400, `Invalid partner data at index ${index}. Each partner must have name, type, and contributionType`);
      }
    });

    center = await DonationCamp.create({
      ...centerData,
      campaignName,
      targetDonations,
      eventPartners: parsedEventPartners,
      registrationDeadline: new Date(registrationDeadline)
    });
  } else if (type === 'BloodBank') {
    if (!licenseNumber || !licenseExpiry || !storageCapacity) {
      throw new ApiError(400, "License details and storage capacity are required for blood banks");
    }
    
    center = await BloodBank.create({
      ...centerData,
      licenseNumber,
      licenseExpiry: new Date(licenseExpiry),
      storageCapacity,
      certifications: certifications || [],
      equipments: equipments || []
    });
  } else {
    throw new ApiError(400, "Invalid center type. Must be either 'DonationCamp' or 'BloodBank'");
  }

  return res.status(201).json(
    new ApiResponse(201, center, "Center created successfully")
  );
});

/**
 * Delete a center
 */
const deleteCenter = asyncHandler(async (req, res) => {
  const { centerId } = req.params;

  if (!centerId) {
    throw new ApiError(400, "Center ID is required");
  }

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(centerId)) {
    throw new ApiError(400, "Invalid center ID format");
  }

  // Find center and verify ownership
  const center = await Center.findOne({
    _id: centerId,
    ngoId: req.ngo._id
  });

  if (!center) {
    throw new ApiError(404, "Center not found or you don't have permission to delete it");
  }

  // Check if there are any active blood donations
  const BloodDonation = mongoose.model('BloodDonation');
  const activeBloodDonations = await BloodDonation.countDocuments({
    centerId,
    status: { $in: ['processing', 'available'] }
  });

  if (activeBloodDonations > 0) {
    throw new ApiError(400, "Cannot delete center with active blood donations");
  }

  // Delete the center
  await center.deleteOne();

  return res.status(200).json(
    new ApiResponse(200, {}, "Center deleted successfully")
  );
});

/**
 * Get a center by ID
 */
const getCenterById = asyncHandler(async (req, res) => {
  const { centerId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(centerId)) {
    throw new ApiError(400, "Invalid center ID format");
  }

  const center = await Center.findOne({
    _id: centerId,
    ngoId: req.ngo._id
  });

  if (!center) {
    throw new ApiError(404, "Center not found or you don't have permission to view it");
  }

  return res.status(200).json(
    new ApiResponse(200, center, "Center fetched successfully")
  );
});

/**
 * Get all centers for an NGO with optional filtering
 */
const getAllCenters = asyncHandler(async (req, res) => {
  const { type, city, page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  // Build query
  const query = { ngoId: req.ngo._id };
  
  if (type) {
    query.type = type;
  }
  
  if (city) {
    query['location.city'] = { $regex: city, $options: 'i' };
  }

  // Execute query with pagination
  const centers = await Center.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Get total count for pagination
  const totalCenters = await Center.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(200, {
      centers,
      pagination: {
        totalCenters,
        totalPages: Math.ceil(totalCenters / limit),
        currentPage: parseInt(page),
        hasNextPage: skip + centers.length < totalCenters,
        hasPrevPage: page > 1
      }
    }, "Centers fetched successfully")
  );
});

export {
  addCenter,
  deleteCenter,
  getCenterById,
  getAllCenters
};