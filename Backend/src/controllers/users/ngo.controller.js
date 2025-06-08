import mongoose from "mongoose";
import { NGO } from "../../models/users/ngo.models.js";
import {
    Facility,
    FACILITY_TYPE,
} from "../../models/donation/facility.models.js";
import { BloodRequest } from "../../models/donation/bloodrequest.models.js";
import { Activity } from "../../models/others/activity.model.js";
import { Notification } from "../../models/others/notification.model.js";
import { User } from "../../models/users/user.models.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { uploadFile } from "../../utils/fileUpload.js";
import { notificationService } from "../../services/notification.service.js";

// Enums and Constants
const NGO_STATUS = {
    PENDING: "PENDING",
    ACTIVE: "ACTIVE",
    SUSPENDED: "SUSPENDED",
    BLACKLISTED: "BLACKLISTED",
};

const FACILITY_OPERATIONS = {
    CREATE: "create",
    UPDATE: "update",
    DELETE: "delete",
    SUSPEND: "suspend",
    ACTIVATE: "activate",
};

// Auth Controllers
const generateTokens = async (ngoId) => {
    try {
        const ngo = await NGO.findById(ngoId);
        const accessToken = ngo.generateAccessToken();
        const refreshToken = ngo.generateRefreshToken();

        ngo.refreshToken = refreshToken;
        ngo.lastLogin = new Date();
        ngo.loginHistory.push({
            timestamp: new Date(),
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
        });

        await ngo.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Token generation failed");
    }
};

const registerNGO = asyncHandler(async (req, res) => {
    const {
        name,
        email,
        password,
        contactPerson,
        address,
        regNumber,
        facilities,
        organizationType,
        operatingHours,
    } = req.body;

    // Enhanced validation
    const validations = [
        { condition: !name?.trim(), message: "NGO name is required" },
        { condition: !email?.trim(), message: "Email is required" },
        {
            condition: !password?.trim() || password.length < 8,
            message: "Password must be at least 8 characters",
        },
        {
            condition: !contactPerson?.name || !contactPerson?.phone,
            message: "Contact person details required",
        },
        {
            condition: !regNumber?.trim(),
            message: "Registration number required",
        },
    ];

    const failedValidation = validations.find((v) => v.condition);
    if (failedValidation) {
        throw new ApiError(400, failedValidation.message);
    }

    // Check existing NGO
    const existingNGO = await NGO.findOne({
        $or: [{ email }, { regNumber }],
    });

    if (existingNGO) {
        throw new ApiError(
            409,
            existingNGO.email === email
                ? "Email already registered"
                : "Registration number already exists"
        );
    }

    // Upload and validate documents
    let documents = {};
    if (req.files) {
        const allowedDocs = [
            "registrationCert",
            "licenseCert",
            "taxExemptionCert",
        ];
        for (const docType of allowedDocs) {
            if (req.files[docType]) {
                documents[docType] = await uploadFile({
                    file: req.files[docType],
                    folder: `ngo-documents/${docType}`,
                });
            }
        }
    }

    const ngo = await NGO.create({
        name,
        email,
        password,
        contactPerson,
        address,
        regNumber,
        facilities,
        organizationType,
        operatingHours,
        documents,
        verificationStatus: "PENDING",
        registrationIP: req.ip,
        deviceInfo: req.headers["user-agent"],
    });

    // Log activity
    await Activity.create({
        type: "NGO_REGISTERED",
        performedBy: {
            userId: ngo._id,
            userModel: "NGO",
        },
        details: {
            ngoId: ngo._id,
            name: ngo.name,
            registrationIP: req.ip,
            timestamp: new Date(),
        },
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            {
                ngo: {
                    _id: ngo._id,
                    name: ngo.name,
                    email: ngo.email,
                    status: ngo.verificationStatus,
                },
            },
            "NGO registration submitted for verification"
        )
    );
});

// Facility Management
const manageFacility = asyncHandler(async (req, res) => {
    const { action } = req.params;
    const ngoId = req.ngo._id;

    // Validate NGO status
    if (req.ngo.status !== NGO_STATUS.ACTIVE) {
        throw new ApiError(403, "NGO must be active to manage facilities");
    }

    if (action === FACILITY_OPERATIONS.CREATE) {
        const facility = await Facility.create({
            ...req.body,
            ngoId,
            facilityType:
                req.body.type === "CAMP"
                    ? FACILITY_TYPE.CAMP
                    : FACILITY_TYPE.CENTER,
            status: req.body.type === "CAMP" ? "PLANNED" : "INACTIVE",
            location: {
                type: "Point",
                coordinates: [req.body.longitude, req.body.latitude],
            },
        });

        if (facility.facilityType === FACILITY_TYPE.CAMP) {
            await notifyNearbyDonors(facility);
        }

        return res
            .status(201)
            .json(
                new ApiResponse(201, facility, "Facility created successfully")
            );
    }

    const facility = await Facility.findOne({
        _id: req.params.facilityId,
        ngoId,
    });
    if (!facility) {
        throw new ApiError(404, "Facility not found");
    }

    switch (action) {
        case FACILITY_OPERATIONS.UPDATE:
            await updateFacility(facility, req.body);
            break;
        case FACILITY_OPERATIONS.DELETE:
            await deleteFacility(facility);
            break;
        case FACILITY_OPERATIONS.SUSPEND:
        case FACILITY_OPERATIONS.ACTIVATE:
            await updateFacilityStatus(facility, action);
            break;
        default:
            throw new ApiError(400, "Invalid operation");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, facility, `Facility ${action}d successfully`)
        );
});

// Blood Request Management
const handleBloodRequest = asyncHandler(async (req, res) => {
    const { requestId } = req.params;
    const { action, notes, assignedDonors } = req.body;
    const ngoId = req.ngo._id;

    const request = await BloodRequest.findOne({ _id: requestId }).populate(
        "hospitalId",
        "name address contactInfo"
    );

    if (!request) {
        throw new ApiError(404, "Blood request not found");
    }

    // Update request status
    await request.updateStatus(action, ngoId, notes);

    // Handle different actions
    switch (action) {
        case "ACCEPTED":
            await handleAcceptedRequest(request, assignedDonors);
            break;
        case "COMPLETED":
            await handleCompletedRequest(request);
            break;
        case "REJECTED":
            await handleRejectedRequest(request, notes);
            break;
    }

    return res
        .status(200)
        .json(new ApiResponse(200, request, "Request handled successfully"));
});

// Analytics & Reports
const getNGOAnalytics = asyncHandler(async (req, res) => {
    const ngoId = req.ngo._id;
    const { startDate, endDate } = req.query;

    const [facilityStats, donationStats, requestStats, impactMetrics] =
        await Promise.all([
            getFacilityStatistics(ngoId, startDate, endDate),
            getDonationStatistics(ngoId, startDate, endDate),
            getRequestStatistics(ngoId, startDate, endDate),
            calculateImpactMetrics(ngoId),
        ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                facilityStats,
                donationStats,
                requestStats,
                impactMetrics,
                timeframe: { startDate, endDate },
            },
            "Analytics fetched successfully"
        )
    );
});

// Helper Functions
const notifyNearbyDonors = async (facility) => {
    const nearbyUsers = await User.find({
        "address.location": {
            $near: {
                $geometry: facility.location,
                $maxDistance: 10000, // 10km radius
            },
        },
        donorStatus: "Active",
        notificationPreferences: {
            $elemMatch: { type: "CAMP_ANNOUNCEMENTS", enabled: true },
        },
    }).select("_id email phone");

    await notificationService.sendBulkNotifications(
        nearbyUsers,
        "NEW_FACILITY_ANNOUNCEMENT",
        {
            facilityId: facility._id,
            facilityName: facility.name,
            facilityType: facility.facilityType,
            startDate: facility.schedule?.startDate,
            location: facility.address,
        }
    );
};

export {
    registerNGO,
    loginNGO,
    manageFacility,
    handleBloodRequest,
    getNGOAnalytics,
    NGO_STATUS,
    FACILITY_OPERATIONS,
};