import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import BloodDonation from "../models/blood.models.js";
import BloodRequest from "../models/bloodrequest.models.js";
import { Center } from "../models/center.models.js";
import Hospital from "../models/hospital.models.js";
import NGO from "../models/ngo.models.js";

/**
 * Create a blood request (from hospital to NGO)
 */
const createBloodRequest = asyncHandler(async (req, res) => {
  const { ngoId, bloodGroups, urgencyLevel, requestNotes } = req.body;
  const hospitalId = req.hospital._id;

  if (!ngoId || !bloodGroups || !bloodGroups.length) {
    throw new ApiError(400, "NGO ID and blood groups are required");
  }

  // Validate blood groups format
  bloodGroups.forEach(item => {
    if (!item.bloodGroup || !item.units) {
      throw new ApiError(400, "Each blood group request must include bloodGroup and units");
    }
  });

  // Create new blood request
  const bloodRequest = new BloodRequest({
    hospitalId,
    ngoId,
    bloodGroups,
    urgencyLevel: urgencyLevel || 'Regular',
    requestNotes,
    status: 'Pending'
  });

  const savedRequest = await bloodRequest.save();

  // Notify NGO about the request (implement this later)
  // notifyNGOAboutRequest(ngoId, savedRequest);

  return res.status(201).json(
    new ApiResponse(201, savedRequest, "Blood request created successfully")
  );
});

/**
 * Update blood request status
 */
const updateBloodRequestStatus = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const { status, notes, estimatedDeliveryTime } = req.body;
  const ngoId = req.ngo._id;

  if (!requestId || !status) {
    throw new ApiError(400, "Request ID and status are required");
  }

  // Validate status
  const validStatuses = ['Pending', 'Accepted', 'Rejected', 'Processing', 'En Route', 'Delivered', 'Completed'];
  if (!validStatuses.includes(status)) {
    throw new ApiError(400, `Status must be one of: ${validStatuses.join(', ')}`);
  }

  // Find request and check if it belongs to the NGO
  const request = await BloodRequest.findOne({
    _id: requestId,
    ngoId
  });

  if (!request) {
    throw new ApiError(404, "Blood request not found or you don't have permission to update it");
  }

  // Update status
  request.status = status;
  
  // Add notes if provided
  if (notes) {
    request.requestNotes = request.requestNotes 
      ? `${request.requestNotes}\n\n${new Date().toISOString()}: ${notes}`
      : `${new Date().toISOString()}: ${notes}`;
  }
  
  // Add delivery details if status is Accepted or Processing
  if (['Accepted', 'Processing'].includes(status) && estimatedDeliveryTime) {
    request.deliveryDetails = {
      ...request.deliveryDetails,
      estimatedDeliveryTime: new Date(estimatedDeliveryTime)
    };
  }
  
  // Add actual delivery time if status is Delivered
  if (status === 'Delivered') {
    request.deliveryDetails = {
      ...request.deliveryDetails,
      actualDeliveryTime: new Date()
    };
  }

  await request.save();

  // Update NGO statistics if request is completed
  if (status === 'Completed') {
    const ngo = await NGO.findById(ngoId);
    ngo.statistics.totalHospitalsServed += 1;
    await ngo.save();
  }

  return res.status(200).json(
    new ApiResponse(200, request, "Blood request status updated successfully")
  );
});

/**
 * Transfer blood unit to another entity (e.g., to a hospital)
 */
const transferBloodUnit = asyncHandler(async (req, res) => {
  const { donationId } = req.params;
  const { toEntityId, toEntityType, reason, requestId } = req.body;

  if (!donationId || !toEntityId || !toEntityType) {
    throw new ApiError(400, "Donation ID, destination entity ID and type are required");
  }

  // Validate entity type
  const validEntityTypes = ['NGO', 'Center', 'Hospital'];
  if (!validEntityTypes.includes(toEntityType)) {
    throw new ApiError(400, `Entity type must be one of: ${validEntityTypes.join(', ')}`);
  }

  // Find donation
  const donation = await BloodDonation.findOne({
    _id: donationId,
    ngoId: req.ngo._id
  });

  if (!donation) {
    throw new ApiError(404, "Blood donation not found or you don't have permission to transfer it");
  }

  // Check if donation is available
  if (donation.status !== 'available') {
    throw new ApiError(400, `Cannot transfer blood unit with status: ${donation.status}. Unit must be 'available'`);
  }

  // Transfer the blood unit
  await donation.transferTo(toEntityId, toEntityType, reason);

  // Update status to assigned if transferring to a hospital
  if (toEntityType === 'Hospital') {
    donation.status = 'assigned';
    await donation.save();
    
    // If this transfer is part of a blood request, update the request status
    if (requestId) {
      const request = await BloodRequest.findById(requestId);
      if (request && ['Pending', 'Accepted'].includes(request.status)) {
        request.status = 'Processing';
        await request.save();
      }
    }
  }

  // Update source center inventory
  const sourceCenter = await Center.findById(donation.centerId);
  if (sourceCenter) {
    await sourceCenter.updateBloodInventory();
  }

  // Update destination center inventory if transferring to another center
  if (toEntityType === 'Center') {
    const destCenter = await Center.findById(toEntityId);
    if (destCenter) {
      await destCenter.updateBloodInventory();
    }
  }

  return res.status(200).json(
    new ApiResponse(200, donation, "Blood unit transferred successfully")
  );
});

/**
 * Get blood requests for an NGO
 */
const getNGOBloodRequests = asyncHandler(async (req, res) => {
  const { status, urgencyLevel, page = 1, limit = 10 } = req.query;
  const ngoId = req.ngo._id;
  const skip = (page - 1) * limit;

  // Build query
  const query = { ngoId };

  if (status) query.status = status;
  if (urgencyLevel) query.urgencyLevel = urgencyLevel;

  // Execute query with pagination
  const requests = await BloodRequest.find(query)
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('hospitalId', 'name contactPerson.name address.city');

  // Get total count for pagination
  const totalRequests = await BloodRequest.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(200, {
      requests,
      pagination: {
        totalRequests,
        totalPages: Math.ceil(totalRequests / limit),
        currentPage: parseInt(page),
        hasNextPage: skip + requests.length < totalRequests,
        hasPrevPage: page > 1
      }
    }, "Blood requests fetched successfully")
  );
});

/**
 * Get blood requests for a hospital
 */
const getHospitalBloodRequests = asyncHandler(async (req, res) => {
  const { status, urgencyLevel, page = 1, limit = 10 } = req.query;
  const hospitalId = req.hospital._id;
  const skip = (page - 1) * limit;

  // Build query
  const query = { hospitalId };

  if (status) query.status = status;
  if (urgencyLevel) query.urgencyLevel = urgencyLevel;

  // Execute query with pagination
  const requests = await BloodRequest.find(query)
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('ngoId', 'name contactPerson.name');

  // Get total count for pagination
  const totalRequests = await BloodRequest.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(200, {
      requests,
      pagination: {
        totalRequests,
        totalPages: Math.ceil(totalRequests / limit),
        currentPage: parseInt(page),
        hasNextPage: skip + requests.length < totalRequests,
        hasPrevPage: page > 1
      }
    }, "Blood requests fetched successfully")
  );
});

/**
 * Confirm blood delivery (by hospital)
 */
const confirmBloodDelivery = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const { receivedBy, notes, confirmationCode } = req.body;
  const hospitalId = req.hospital._id;

  if (!requestId || !receivedBy) {
    throw new ApiError(400, "Request ID and receiver name are required");
  }

  // Find request and check if it belongs to the hospital
  const request = await BloodRequest.findOne({
    _id: requestId,
    hospitalId,
    status: 'En Route'
  });

  if (!request) {
    throw new ApiError(404, "Blood request not found or not in delivery status");
  }

  // Update delivery details
  request.status = 'Delivered';
  request.deliveryDetails = {
    ...request.deliveryDetails,
    actualDeliveryTime: new Date(),
    receivedBy,
    confirmationCode: confirmationCode || Math.random().toString(36).substring(2, 8).toUpperCase()
  };

  if (notes) {
    request.requestNotes = request.requestNotes 
      ? `${request.requestNotes}\n\nReceived: ${notes}`
      : `Received: ${notes}`;
  }

  await request.save();

  return res.status(200).json(
    new ApiResponse(200, request, "Blood delivery confirmed successfully")
  );
});

export {
  createBloodRequest,
  updateBloodRequestStatus,
  transferBloodUnit,
  getNGOBloodRequests,
  getHospitalBloodRequests,
  confirmBloodDelivery
};