import { BloodRequest } from "../models/donation/bloodrequest.models.js";
import { Hospital } from "../models/users/hospital.models.js";
import { NGO } from "../models/users/ngo.models.js";
import { User } from "../models/users/user.models.js";
import { Activity } from "../models/others/activity.model.js";
import { Notification } from "../models/others/notification.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Create Blood Request
const createBloodRequest = asyncHandler(async (req, res) => {
    const {
        bloodGroups,
        urgencyLevel,
        requiredBy,
        patientInfo,
        hospitalId,
        requestNotes,
    } = req.body;

    // Validate blood request
    if (!bloodGroups || bloodGroups.length === 0) {
        throw new ApiError(400, "Blood group details are required");
    }

    // Find nearest NGOs based on location
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
        throw new ApiError(404, "Hospital not found");
    }

    const nearbyNGOs = await hospital.findNearbyNGOs(20000); // 20km radius
    if (!nearbyNGOs || nearbyNGOs.length === 0) {
        throw new ApiError(404, "No NGOs found in nearby area");
    }

    // Create request for each matching NGO
    const requests = await Promise.all(
        nearbyNGOs.map(async (ngo) => {
            const request = await BloodRequest.create({
                requestId: `BR${Date.now()}`,
                hospitalId,
                ngoId: ngo._id,
                bloodGroups,
                urgencyLevel,
                requiredBy,
                patientInfo,
                requestNotes,
                status: "PENDING",
            });

            // Create notification for NGO
            await Notification.create({
                type: "URGENT_BLOOD_REQUEST",
                recipient: ngo._id,
                recipientModel: "NGO",
                data: {
                    requestId: request._id,
                    bloodGroups,
                    hospital: hospital.name,
                    urgencyLevel,
                },
            });

            return request;
        })
    );

    // Log activity
    await Activity.create({
        type: "BLOOD_REQUEST_CREATED",
        performedBy: {
            userId: req.user._id,
            userModel: req.user.role,
        },
        details: {
            requestIds: requests.map((r) => r._id),
            bloodGroups,
            urgencyLevel,
        },
    });

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                requests,
                "Blood requests created successfully"
            )
        );
});

// Handle Request Status Update
const updateRequestStatus = asyncHandler(async (req, res) => {
    const { requestId } = req.params;
    const { status, notes } = req.body;

    const request = await BloodRequest.findById(requestId);
    if (!request) {
        throw new ApiError(404, "Blood request not found");
    }

    await request.updateStatus(status, req.user._id, notes);

    // Notify relevant parties
    await Notification.create({
        type: "REQUEST_STATUS_UPDATE",
        recipient: request.hospitalId,
        recipientModel: "Hospital",
        data: {
            requestId: request._id,
            status,
            notes,
        },
    });

    return res
        .status(200)
        .json(
            new ApiResponse(200, request, "Request status updated successfully")
        );
});

// Find Available Donors
const findDonors = asyncHandler(async (req, res) => {
    const { requestId } = req.params;

    const request = await BloodRequest.findById(requestId);
    if (!request) {
        throw new ApiError(404, "Blood request not found");
    }

    const bloodGroups = request.bloodGroups.map((bg) => bg.bloodGroup);

    // Find eligible donors within radius
    const donors = await User.find({
        bloodType: { $in: bloodGroups },
        donorStatus: "Active",
        "address.location": {
            $near: {
                $geometry: request.hospital.location,
                $maxDistance: 10000, // 10km radius
            },
        },
    }).select("name bloodType lastDonationDate phone email");

    return res
        .status(200)
        .json(new ApiResponse(200, donors, "Eligible donors found"));
});

// Get Emergency Requests
const getEmergencyRequests = asyncHandler(async (req, res) => {
    const emergencyRequests = await BloodRequest.find({
        urgencyLevel: "EMERGENCY",
        status: { $nin: ["COMPLETED", "CANCELLED"] },
    }).populate("hospitalId", "name address");

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                emergencyRequests,
                "Emergency requests fetched"
            )
        );
});

// Track Request Status
const trackRequest = asyncHandler(async (req, res) => {
    const { requestId } = req.params;

    const request = await BloodRequest.findById(requestId)
        .populate("hospitalId", "name address")
        .populate("ngoId", "name")
        .select("-patientInfo.confidential");

    if (!request) {
        throw new ApiError(404, "Blood request not found");
    }

    const status = request.calculateFulfillmentStatus();

    return res
        .status(200)
        .json(
            new ApiResponse(200, { request, status }, "Request details fetched")
        );
});

// Cancel Request
const cancelRequest = asyncHandler(async (req, res) => {
    const { requestId } = req.params;
    const { reason } = req.body;

    const request = await BloodRequest.findById(requestId);
    if (!request) {
        throw new ApiError(404, "Blood request not found");
    }

    await request.updateStatus("CANCELLED", req.user._id, reason);

    // Notify relevant parties
    await Promise.all([
        Notification.create({
            type: "REQUEST_CANCELLED",
            recipient: request.hospitalId,
            recipientModel: "Hospital",
            data: { requestId, reason },
        }),
        Notification.create({
            type: "REQUEST_CANCELLED",
            recipient: request.ngoId,
            recipientModel: "NGO",
            data: { requestId, reason },
        }),
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, request, "Request cancelled successfully"));
});

export {
    createBloodRequest,
    updateRequestStatus,
    findDonors,
    getEmergencyRequests,
    trackRequest,
    cancelRequest,
};
