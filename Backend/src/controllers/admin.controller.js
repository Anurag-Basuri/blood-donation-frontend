import Admin from "../models/admin.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (adminId) => {
    try {
        const admin = await Admin.findById(adminId);
        const accessToken = admin.generateAccessToken();
        const refreshToken = admin.generateRefreshToken();

        admin.refreshToken = refreshToken;
        await admin.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Error generating tokens");
    }
};

// Admin Authentication
const registerAdmin = asyncHandler(async (req, res) => {
    const { fullName, email, password } = req.body;

    if ([fullName, email, password].some((field) => !field?.trim())) {
        throw new ApiError(400, "All fields are required");
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
        throw new ApiError(409, "Admin with email already exists");
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
        throw new ApiError(400, "Email and password are required");
    }

    const admin = await Admin.findByEmailWithPassword(email);
    if (!admin) {
        throw new ApiError(404, "Admin not found");
    }

    if (admin.isAccountLocked()) {
        throw new ApiError(403, "Account is locked. Try again later");
    }

    const isPasswordValid = await admin.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
        admin._id
    );

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
                "Admin logged in successfully"
            )
        );
});

// Admin Management
const updateAdminProfile = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;
    const adminId = req.admin._id;

    const admin = await Admin.findByIdAndUpdate(
        adminId,
        { $set: { fullName, email } },
        { new: true }
    ).select("-password -refreshToken");

    return res
        .status(200)
        .json(
            new ApiResponse(200, admin, "Admin profile updated successfully")
        );
});

const getAdminDashboard = asyncHandler(async (req, res) => {
    const stats = await Promise.all([
        Admin.countDocuments({}),
        BloodDonation.countDocuments({ status: "available" }),
        BloodRequest.countDocuments({ status: "pending" }),
        Hospital.countDocuments({ isVerified: true }),
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalAdmins: stats[0],
                availableBloodUnits: stats[1],
                pendingRequests: stats[2],
                activeHospitals: stats[3],
            },
            "Dashboard data fetched successfully"
        )
    );
});

// Blood Inventory Management
const manageBloodInventory = asyncHandler(async (req, res) => {
    const { centerId, bloodGroup, action, units } = req.body;

    const center = await Center.findById(centerId);
    if (!center) {
        throw new ApiError(404, "Center not found");
    }

    await center.updateBloodInventory(bloodGroup, units, action);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                center.bloodInventory,
                "Inventory updated successfully"
            )
        );
});

// Hospital Management
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
        .json(
            new ApiResponse(
                200,
                hospital,
                "Hospital verification status updated"
            )
        );
});

// Blood Request Management
const manageBloodRequest = asyncHandler(async (req, res) => {
    const { requestId } = req.params;
    const { status, notes } = req.body;

    const bloodRequest = await BloodRequest.findById(requestId);
    if (!bloodRequest) {
        throw new ApiError(404, "Blood request not found");
    }

    await bloodRequest.updateStatus(status, req.admin._id, notes);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                bloodRequest,
                "Blood request updated successfully"
            )
        );
});

// Reports and Analytics
const generateReports = asyncHandler(async (req, res) => {
    const { startDate, endDate, reportType } = req.body;

    const reportData = await BloodDonation.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate),
                },
            },
        },
        {
            $group: {
                _id: "$bloodGroup",
                total: { $sum: 1 },
                available: {
                    $sum: {
                        $cond: [{ $eq: ["$status", "available"] }, 1, 0],
                    },
                },
            },
        },
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(200, reportData, "Report generated successfully")
        );
});

export {
    registerAdmin,
    loginAdmin,
    updateAdminProfile,
    getAdminDashboard,
    manageBloodInventory,
    verifyHospital,
    manageBloodRequest,
    generateReports,
};
