import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import BloodDonation from "../models/blood.models.js";
import { Center } from "../models/center.models.js";
import NGO from "../models/ngo.models.js";
import mongoose from "mongoose";

/**
 * Register a new blood donation at a center
 * (Used by NGO staff at centers)
 */
const registerBloodDonation = asyncHandler(async (req, res) => {
  const {
    userId,
    centerId,
    bloodGroup,
    donationAmount,
    donationDate,
    healthMetrics,
    notes
  } = req.body;

  // Validate required fields
  if (!userId || !centerId || !bloodGroup) {
    throw new ApiError(400, "User ID, Center ID, and Blood Group are required");
  }

  // Check if center exists and belongs to the NGO making the request
  const center = await Center.findOne({
    _id: centerId,
    ngoId: req.ngo._id
  });

  if (!center) {
    throw new ApiError(404, "Center not found or you don't have permission to register donations for this center");
  }

  // Create new blood donation
  const bloodDonation = new BloodDonation({
    userId,
    ngoId: req.ngo._id,
    centerId,
    centerType: center.type,
    bloodGroup,
    donationAmount: donationAmount || 450, // Default amount if not specified
    donationDate: donationDate || new Date(),
    donationCenter: center.name,
    healthMetrics: healthMetrics || {},
    notes,
    status: 'processing',
    currentLocation: {
      entityId: centerId,
      entityType: 'Center',
      updatedAt: new Date()
    }
  });

  // Save the blood donation
  const savedDonation = await bloodDonation.save();

  // Update center statistics
  center.statistics.totalDonations += 1;
  center.statistics.totalDonors = await BloodDonation.distinct('userId', { centerId }).length;
  center.statistics.lastDonationDate = new Date();
  await center.save();

  // Update blood inventory
  await center.updateBloodInventory();

  // Update NGO statistics
  const ngo = await NGO.findById(req.ngo._id);
  ngo.statistics.totalDonationsCollected += 1;
  await ngo.save();

  return res.status(201).json(
    new ApiResponse(201, savedDonation, "Blood donation registered successfully")
  );
});

/**
 * Get all blood donations for an NGO
 * (Filtered by center, status, blood group, etc.)
 */
const getNGOBloodDonations = asyncHandler(async (req, res) => {
  const { centerId, status, bloodGroup, page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  // Build query
  const query = { ngoId: req.ngo._id };

  if (centerId) query.centerId = centerId;
  if (status) query.status = status;
  if (bloodGroup) query.bloodGroup = bloodGroup;

  // Execute query with pagination
  const donations = await BloodDonation.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('userId', 'fullName email')
    .populate('centerId', 'name type location.city')
    .populate('currentLocation.entityId', 'name');

  // Get total count for pagination
  const totalDonations = await BloodDonation.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(200, {
      donations,
      pagination: {
        totalDonations,
        totalPages: Math.ceil(totalDonations / limit),
        currentPage: parseInt(page),
        hasNextPage: skip + donations.length < totalDonations,
        hasPrevPage: page > 1
      }
    }, "Blood donations fetched successfully")
  );
});

/**
 * Update blood donation status
 * (E.g., from processing to available)
 */
const updateBloodDonationStatus = asyncHandler(async (req, res) => {
  const { donationId } = req.params;
  const { status, notes } = req.body;

  if (!donationId || !status) {
    throw new ApiError(400, "Donation ID and status are required");
  }

  // Validate status
  const validStatuses = ['processing', 'available', 'assigned', 'used', 'expired', 'discarded'];
  if (!validStatuses.includes(status)) {
    throw new ApiError(400, `Status must be one of: ${validStatuses.join(', ')}`);
  }

  // Find donation and check if it belongs to the NGO
  const donation = await BloodDonation.findOne({
    _id: donationId,
    ngoId: req.ngo._id
  });

  if (!donation) {
    throw new ApiError(404, "Blood donation not found or you don't have permission to update it");
  }

  // Update status
  donation.status = status;
  if (notes) donation.notes = notes;
  
  // Add verification info
  donation.lastVerifiedBy = {
    adminId: req.ngo._id, // Using NGO ID as admin ID
    date: new Date()
  };

  await donation.save();

  // Update center inventory
  const center = await Center.findById(donation.centerId);
  if (center) {
    await center.updateBloodInventory();
  }

  return res.status(200).json(
    new ApiResponse(200, donation, "Blood donation status updated successfully")
  );
});

/**
 * Get blood inventory across all centers for an NGO
 */
const getNGOBloodInventory = asyncHandler(async (req, res) => {
  const ngoId = req.ngo._id;

  // Get all centers for this NGO
  const centers = await Center.find({ ngoId });
  
  // Initialize inventory summary
  const inventory = {
    total: {},
    byCenter: {},
    expiringSoon: []
  };
  
  // Initialize blood groups
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  bloodGroups.forEach(group => {
    inventory.total[group] = { total: 0, available: 0 };
  });
  
  // Build inventory by center
  for (const center of centers) {
    const centerInventory = {};
    
    bloodGroups.forEach(group => {
      centerInventory[group] = { total: 0, available: 0 };
    });
    
    // Get blood donations for this center
    const donations = await BloodDonation.find({
      centerId: center._id,
      currentLocation: { entityId: center._id }
    });
    
    // Count donations by blood group and status
    donations.forEach(donation => {
      const { bloodGroup, status } = donation;
      
      // Update center inventory
      centerInventory[bloodGroup].total += 1;
      if (status === 'available') {
        centerInventory[bloodGroup].available += 1;
      }
      
      // Update total inventory
      inventory.total[bloodGroup].total += 1;
      if (status === 'available') {
        inventory.total[bloodGroup].available += 1;
      }
      
      // Check if expiring soon (within 7 days)
      const today = new Date();
      const expiryDate = new Date(donation.expiryDate);
      const daysToExpiry = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));
      
      if (status === 'available' && daysToExpiry <= 7 && daysToExpiry >= 0) {
        inventory.expiringSoon.push({
          id: donation._id,
          bloodGroup: donation.bloodGroup,
          expiryDate: donation.expiryDate,
          daysRemaining: daysToExpiry,
          centerName: center.name,
          centerId: center._id
        });
      }
    });
    
    inventory.byCenter[center._id] = {
      centerName: center.name,
      centerType: center.type,
      inventory: centerInventory
    };
  }
  
  // Sort expiring soon by days remaining
  inventory.expiringSoon.sort((a, b) => a.daysRemaining - b.daysRemaining);
  
  return res.status(200).json(
    new ApiResponse(200, inventory, "Blood inventory fetched successfully")
  );
});

/**
 * Get detailed information about a specific blood donation
 */
const getBloodDonationDetails = asyncHandler(async (req, res) => {
  const { donationId } = req.params;
  
  if (!donationId) {
    throw new ApiError(400, "Donation ID is required");
  }
  
  const donation = await BloodDonation.findOne({
    _id: donationId,
    ngoId: req.ngo._id
  })
    .populate('userId', 'fullName email')
    .populate('centerId', 'name type location')
    .populate('transferHistory.fromId transferHistory.toId', 'name')
    .populate('currentLocation.entityId', 'name');
  
  if (!donation) {
    throw new ApiError(404, "Blood donation not found or you don't have permission to view it");
  }
  
  return res.status(200).json(
    new ApiResponse(200, donation, "Blood donation details fetched successfully")
  );
});

/**
 * Get expiring blood donations
 */
const getExpiringBloodDonations = asyncHandler(async (req, res) => {
  const { days = 7 } = req.query;
  const ngoId = req.ngo._id;
  
  const today = new Date();
  const expiryLimit = new Date();
  expiryLimit.setDate(today.getDate() + parseInt(days));
  
  const expiringDonations = await BloodDonation.find({
    ngoId,
    status: 'available',
    expiryDate: { $gte: today, $lte: expiryLimit }
  })
  .sort({ expiryDate: 1 })
  .populate('centerId', 'name location.city')
  .populate('userId', 'fullName');
  
  return res.status(200).json(
    new ApiResponse(200, expiringDonations, "Expiring blood donations fetched successfully")
  );
});

export {
  registerBloodDonation,
  getNGOBloodDonations,
  updateBloodDonationStatus,
  getNGOBloodInventory,
  getBloodDonationDetails,
  getExpiringBloodDonations
};