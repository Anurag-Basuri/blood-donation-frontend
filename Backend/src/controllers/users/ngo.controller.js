import mongoose from "mongoose";
import { NGO } from "../../models/users/ngo.models.js";
import { Center } from "../../models/donation/center.models.js";
import { DonationCamp } from "../../models/donation/camp.models.js";
import { BloodRequest } from "../../models/donation/bloodrequest.models.js";
import { Activity } from "../../models/others/activity.model.js";
import { Notification } from "../../models/others/notification.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { uploadFile } from "../../utils/fileUpload.js";
import { notificationService } from "../../services/notification.service.js";

// Generate Auth Tokens
const generateTokens = async (ngoId) => {
    try {
        const ngo = await NGO.findById(ngoId);
        const accessToken = ngo.generateAccessToken();
        const refreshToken = ngo.generateRefreshToken();

        ngo.refreshToken = refreshToken;
        ngo.lastLogin = new Date();
        await ngo.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Token generation failed");
    }
};

// Auth Controllers
const registerNGO = asyncHandler(async (req, res) => {
    const {
        name,
        email,
        password,
        contactPerson,
        address,
        regNumber,
        facilities,
    } = req.body;

    // Validate required fields
    if (
        [name, email, password, contactPerson?.name, regNumber].some(
            (field) => !field?.trim()
        )
    ) {
        throw new ApiError(400, "All required fields must be provided");
    }

    // Check existing NGO
    const existingNGO = await NGO.findOne({
        $or: [{ email }, { regNumber }],
    });

    if (existingNGO) {
        throw new ApiError(409, "NGO already exists");
    }

    // Upload documents if provided
    let registrationDocument;
    if (req.files?.registrationCert) {
        registrationDocument = await uploadFile(
            req.files.registrationCert,
            "ngo-documents"
        );
    }

    // Create NGO
    const ngo = await NGO.create({
        name,
        email,
        password,
        contactPerson,
        address,
        regNumber,
        facilities,
        registrationDocument,
        verificationStatus: "PENDING",
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
        },
    });

    return res
        .status(201)
        .json(new ApiResponse(201, ngo, "NGO registered successfully"));
});

// Login Controller
const loginNGO = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password required");
    }

    const ngo = await NGO.findOne({ email }).select("+password");
    if (!ngo || !(await ngo.isPasswordCorrect(password))) {
        throw new ApiError(401, "Invalid credentials");
    }

    if (!ngo.isVerified) {
        throw new ApiError(403, "NGO not verified. Please contact admin.");
    }

    const { accessToken, refreshToken } = await generateTokens(ngo._id);

    return res
        .status(200)
        .cookie("accessToken", accessToken, { httpOnly: true })
        .cookie("refreshToken", refreshToken, { httpOnly: true })
        .json(
            new ApiResponse(
                200,
                { ngo, tokens: { accessToken, refreshToken } },
                "Login successful"
            )
        );
});

// Donation Center Management
const manageDonationCenter = asyncHandler(async (req, res) => {
    const { action } = req.params;
    const ngoId = req.ngo._id;

    if (action === "create") {
        const center = await Center.create({
            ...req.body,
            ngoId,
            status: "INACTIVE", // Requires admin verification
        });

        await Activity.create({
            type: "CENTER_CREATED",
            performedBy: {
                userId: ngoId,
                userModel: "NGO",
            },
            details: {
                centerId: center._id,
                location: center.address,
            },
        });

        return res
            .status(201)
            .json(new ApiResponse(201, center, "Center created successfully"));
    }

    // For update/delete operations
    const center = await Center.findOne({ _id: req.params.centerId, ngoId });
    if (!center) {
        throw new ApiError(404, "Center not found");
    }

    if (action === "update") {
        Object.assign(center, req.body);
        await center.save();
    } else if (action === "delete") {
        // Soft delete if center has donation history
        if (center.statistics.totalDonations > 0) {
            center.status = "INACTIVE";
            await center.save();
        } else {
            await center.deleteOne();
        }
    }

    return res
        .status(200)
        .json(new ApiResponse(200, center, `Center ${action}d successfully`));
});

// Camp Management
const manageDonationCamp = asyncHandler(async (req, res) => {
    const { action } = req.params;
    const ngoId = req.ngo._id;

    if (action === "create") {
        const camp = await DonationCamp.create({
            ...req.body,
            ngoId,
            status: "PLANNED",
        });

        // Find nearby donors
        const nearbyUsers = await User.find({
            "address.location": {
                $near: {
                    $geometry: camp.venue.location,
                    $maxDistance: 10000, // 10km radius
                },
            },
            donorStatus: "Active",
        });

        // Send notifications
        await Promise.all(
            nearbyUsers.map((user) =>
                notificationService.sendNotification(
                    "CAMP_ANNOUNCEMENT",
                    user,
                    {
                        campId: camp._id,
                        campName: camp.name,
                        date: camp.schedule.startDate,
                    }
                )
            )
        );

        return res
            .status(201)
            .json(new ApiResponse(201, camp, "Camp created successfully"));
    }

    // Handle other camp operations (update, cancel, complete)
    const camp = await DonationCamp.findOne({ _id: req.params.campId, ngoId });
    if (!camp) {
        throw new ApiError(404, "Camp not found");
    }

    if (action === "update") {
        Object.assign(camp, req.body);
        await camp.save();
    } else if (action === "cancel") {
        await camp.updateStatus("CANCELLED");
        // Notify registered donors
        await notificationService.notifyRegisteredDonors(
            camp._id,
            "CAMP_CANCELLED"
        );
    }

    return res
        .status(200)
        .json(new ApiResponse(200, camp, `Camp ${action}d successfully`));
});

// Request Management
const handleBloodRequest = asyncHandler(async (req, res) => {
    const { requestId } = req.params;
    const { action, notes } = req.body;
    const ngoId = req.ngo._id;

    const request = await BloodRequest.findOne({ _id: requestId, ngoId });
    if (!request) {
        throw new ApiError(404, "Request not found");
    }

    await request.updateStatus(action, req.ngo._id, notes);

    // For accepted requests, find potential donors
    if (action === "ACCEPTED") {
        const potentialDonors = await findEligibleDonors(request);
        await notificationService.notifyDonors(potentialDonors, request);
    }

    return res
        .status(200)
        .json(new ApiResponse(200, request, "Request status updated"));
});

// Analytics & Reports
const getNGOAnalytics = asyncHandler(async (req, res) => {
    const ngoId = req.ngo._id;
    const { startDate, endDate } = req.query;

    const [campStats, donationStats, requestStats] = await Promise.all([
        DonationCamp.aggregate([
            {
                $match: {
                    ngoId: mongoose.Types.ObjectId(ngoId),
                    createdAt: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate),
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    totalCamps: { $sum: 1 },
                    totalDonors: { $sum: "$statistics.totalDonors" },
                    totalUnits: { $sum: "$statistics.totalUnitsCollected" },
                },
            },
        ]),
        // Add other aggregations for donations and requests
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                campStats,
                donationStats,
                requestStats,
            },
            "Analytics fetched successfully"
        )
    );
});

export {
    registerNGO,
    loginNGO,
    manageDonationCenter,
    manageDonationCamp,
    handleBloodRequest,
    getNGOAnalytics,
};