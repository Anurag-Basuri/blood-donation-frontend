import Admin from "../models/admin.models.js";
import Hospital from "../models/hospital.models.js";
import BloodRequest from "../models/bloodrequest.models.js";
import Center from "../models/center.models.js";
import NGO from "../models/ngo.models.js";
import User from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Auth Token Generator
const generateTokens = async (adminId) => {
    try {
        const admin = await Admin.findById(adminId);
        const accessToken = admin.generateAccessToken();
        const refreshToken = admin.generateRefreshToken();
        admin.refreshToken = refreshToken;
        await admin.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Token generation failed");
    }
};

// AUTH CONTROLLERS
const registerAdmin = asyncHandler(async (req, res) => {
    const { fullName, email, password } = req.body;

    if ([fullName, email, password].some((field) => !field?.trim())) {
        throw new ApiError(400, "All fields are required");
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
        throw new ApiError(409, "Admin already exists");
    }

    const admin = await Admin.create({
        fullName,
        email,
        password,
        role: "admin",
    });

    const createdAdmin = await Admin.findById(admin._id).select(
        "-password -refreshToken"
    );

    return res
        .status(201)
        .json(
            new ApiResponse(201, createdAdmin, "Admin registered successfully")
        );
});

const loginAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password required");
    }

    const admin = await Admin.findByEmailWithPassword(email);
    if (!admin || !(await admin.isPasswordCorrect(password))) {
        throw new ApiError(401, "Invalid credentials");
    }

    const { accessToken, refreshToken } = await generateTokens(admin._id);
    const loggedInAdmin = await Admin.findById(admin._id).select(
        "-password -refreshToken"
    );

    return res
        .status(200)
        .cookie("accessToken", accessToken, { httpOnly: true })
        .cookie("refreshToken", refreshToken, { httpOnly: true })
        .json(
            new ApiResponse(
                200,
                {
                    admin: loggedInAdmin,
                    accessToken,
                    refreshToken,
                },
                "Login successful"
            )
        );
});

// DASHBOARD CONTROLLERS
const getDashboardStats = asyncHandler(async (req, res) => {
    const [hospitals, requests, ngos, users] = await Promise.all([
        Hospital.countDocuments({ isVerified: true }),
        BloodRequest.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                    urgent: {
                        $sum: {
                            $cond: [
                                { $eq: ["$urgencyLevel", "Emergency"] },
                                1,
                                0,
                            ],
                        },
                    },
                },
            },
        ]),
        NGO.aggregate([
            {
                $group: {
                    _id: null,
                    totalCamps: { $sum: "$statistics.totalCampsOrganized" },
                    totalDonations: {
                        $sum: "$statistics.totalDonationsCollected",
                    },
                },
            },
        ]),
        User.aggregate([
            {
                $group: {
                    _id: "$donorStatus",
                    count: { $sum: 1 },
                },
            },
        ]),
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                hospitals,
                requests,
                ngos,
                users,
            },
            "Dashboard data fetched"
        )
    );
});

// HOSPITAL MANAGEMENT
const verifyHospital = asyncHandler(async (req, res) => {
    const { hospitalId } = req.params;
    const { status, remarks } = req.body;

    const hospital = await Hospital.findByIdAndUpdate(
        hospitalId,
        {
            $set: {
                isVerified: status === "approved",
                verificationRemarks: remarks,
            },
        },
        { new: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, hospital, "Hospital verification updated"));
});

// BLOOD REQUEST MANAGEMENT
const handleBloodRequest = asyncHandler(async (req, res) => {
    const { requestId } = req.params;
    const { status, notes } = req.body;

    const bloodRequest = await BloodRequest.findById(requestId);
    if (!bloodRequest) {
        throw new ApiError(404, "Request not found");
    }

    await bloodRequest.updateStatus(status, req.admin._id, notes);

    return res
        .status(200)
        .json(
            new ApiResponse(200, bloodRequest, "Request updated successfully")
        );
});

// EMERGENCY HANDLING
const handleEmergency = asyncHandler(async (req, res) => {
    const { requestId } = req.params;
    const { action } = req.body;

    const request = await BloodRequest.findById(requestId);
    if (!request) {
        throw new ApiError(404, "Emergency request not found");
    }

    const nearbyDonors = await User.find({
        "address.location": {
            $near: {
                $geometry: request.hospital.location,
                $maxDistance: 20000, // 20km radius
            },
        },
        bloodType: request.bloodGroup,
        donorStatus: "Active",
    });

    request.status = action;
    await request.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                request,
                potentialDonors: nearbyDonors.length,
            },
            "Emergency handled"
        )
    );
});

export {
    registerAdmin,
    loginAdmin,
    getDashboardStats,
    verifyHospital,
    handleBloodRequest,
    handleEmergency,
};
