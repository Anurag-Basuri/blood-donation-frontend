import { PlasmaRequest } from "../models/donation/plasmarequest.models.js";
import { Hospital } from "../models/users/hospital.models.js";
import { NGO } from "../models/users/ngo.models.js";
import { User } from "../models/users/user.models.js";
import { Activity } from "../models/others/activity.model.js";
import { Notification } from "../models/others/notification.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Create Plasma Request
const createPlasmaRequest = asyncHandler(async (req, res) => {
    const {
        bloodGroup,
        units,
        urgency,
        requiredBy,
        hospitalId,
        patientInfo,
        covidRecovered,
        antibodyTiter,
    } = req.body;

    // Validate request
    if (!bloodGroup || !units || !hospitalId) {
        throw new ApiError(400, "Missing required fields");
    }

    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
        throw new ApiError(404, "Hospital not found");
    }

    // Find nearby NGOs
    const nearbyNGOs = await hospital.findNearbyNGOs(20000); // 20km radius
    if (!nearbyNGOs?.length) {
        throw new ApiError(404, "No NGOs found in nearby area");
    }

    const request = await PlasmaRequest.create({
        hospitalId,
        bloodGroup,
        units,
        urgency,
        requiredBy,
        patientInfo,
        covidRecovered,
        antibodyTiter,
        status: "PENDING",
    });

    // Notify NGOs
    await Promise.all(
        nearbyNGOs.map((ngo) =>
            Notification.create({
                type: "URGENT_BLOOD_REQUEST",
                recipient: ngo._id,
                recipientModel: "NGO",
                data: {
                    requestId: request._id,
                    bloodGroup,
                    hospital: hospital.name,
                    urgency,
                    isPlasma: true,
                },
            })
        )
    );

    // Log activity
    await Activity.create({
        type: "PLASMA_REQUEST_CREATED",
        performedBy: {
            userId: req.user._id,
            userModel: req.user.role,
        },
        details: {
            requestId: request._id,
            bloodGroup,
            units,
            urgency,
        },
    });

    return res
        .status(201)
        .json(
            new ApiResponse(201, request, "Plasma request created successfully")
        );
});

// Update Request Status
const updateRequestStatus = asyncHandler(async (req, res) => {
    const { requestId } = req.params;
    const { status, notes } = req.body;

    const request = await PlasmaRequest.findById(requestId);
    if (!request) {
        throw new ApiError(404, "Plasma request not found");
    }

    await request.updateStatus(status, req.user._id, notes);

    // Notify hospital
    await Notification.create({
        type: "REQUEST_STATUS_UPDATE",
        recipient: request.hospitalId,
        recipientModel: "Hospital",
        data: {
            requestId: request._id,
            status,
            notes,
            requestType: "plasma",
        },
    });

    return res
        .status(200)
        .json(
            new ApiResponse(200, request, "Request status updated successfully")
        );
});

// Find Eligible Donors
const findEligibleDonors = asyncHandler(async (req, res) => {
    const { requestId } = req.params;

    const request = await PlasmaRequest.findById(requestId);
    if (!request) {
        throw new ApiError(404, "Request not found");
    }

    // Find eligible donors based on criteria
    const donors = await User.find({
        bloodType: request.bloodGroup,
        donorStatus: "Active",
        "address.location": {
            $near: {
                $geometry: request.hospital.location,
                $maxDistance: 10000, // 10km radius
            },
        },
        covidRecovered: true, // Only COVID recovered donors for plasma
        lastDonationDate: {
            $lt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days gap
        },
    }).select("name bloodType lastDonationDate phone email covidRecoveryDate");

    return res
        .status(200)
        .json(new ApiResponse(200, donors, "Eligible plasma donors found"));
});

// Track Request
const trackRequest = asyncHandler(async (req, res) => {
    const { requestId } = req.params;

    const request = await PlasmaRequest.findById(requestId)
        .populate("hospitalId", "name address")
        .select("-patientInfo.confidential");

    if (!request) {
        throw new ApiError(404, "Plasma request not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, request, "Request details fetched"));
});

// Get Emergency Plasma Requests
const getEmergencyRequests = asyncHandler(async (req, res) => {
    const emergencyRequests = await PlasmaRequest.find({
        urgency: "Critical",
        status: { $nin: ["COMPLETED", "CANCELLED"] },
    }).populate("hospitalId", "name address");

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                emergencyRequests,
                "Emergency plasma requests fetched"
            )
        );
});

// Cancel Request
const cancelRequest = asyncHandler(async (req, res) => {
    const { requestId } = req.params;
    const { reason } = req.body;

    const request = await PlasmaRequest.findById(requestId);
    if (!request) {
        throw new ApiError(404, "Plasma request not found");
    }

    await request.updateStatus("CANCELLED", req.user._id, reason);

    // Log activity
    await Activity.create({
        type: "PLASMA_REQUEST_CANCELLED",
        performedBy: {
            userId: req.user._id,
            userModel: req.user.role,
        },
        details: {
            requestId,
            reason,
        },
    });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                request,
                "Plasma request cancelled successfully"
            )
        );
});

export {
    createPlasmaRequest,
    updateRequestStatus,
    findEligibleDonors,
    trackRequest,
    getEmergencyRequests,
    cancelRequest,
};
