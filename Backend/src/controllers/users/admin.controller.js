import Admin from "../../models/admin.models.js";
import Hospital from "../../models/hospital.models.js";
import NGO from "../../models/ngo.models.js";
import { Activity } from "../../models/others/activity.model.js";
import { Analytics } from "../../models/others/analytics.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

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

// ADMIN AUTH
const registerAdmin = asyncHandler(async (req, res) => {
    const { fullName, email, password, role = "admin" } = req.body;

    // Only superadmin can create new admins
    if (req.admin && req.admin.role !== "superadmin") {
        throw new ApiError(403, "Only superadmin can create new admins");
    }

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
        role,
    });

    await Activity.create({
        type: "ADMIN_CREATED",
        performedBy: {
            userId: req.admin?._id || admin._id,
            userModel: "Admin",
        },
        details: {
            adminId: admin._id,
            role: admin.role,
        },
    });

    return res
        .status(201)
        .json(new ApiResponse(201, admin, "Admin registered successfully"));
});

// VERIFICATION CONTROLLERS
const verifyHospital = asyncHandler(async (req, res) => {
    const { hospitalId } = req.params;
    const { status, remarks, verificationDocuments } = req.body;

    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
        throw new ApiError(404, "Hospital not found");
    }

    hospital.isVerified = status === "approved";
    hospital.verificationRemarks = remarks;
    hospital.verificationDocuments = verificationDocuments;
    hospital.verifiedBy = {
        adminId: req.admin._id,
        verifiedAt: new Date(),
    };

    await hospital.save();

    await Activity.create({
        type: "HOSPITAL_VERIFICATION",
        performedBy: {
            userId: req.admin._id,
            userModel: "Admin",
        },
        details: {
            hospitalId,
            status,
            remarks,
        },
    });

    return res
        .status(200)
        .json(new ApiResponse(200, hospital, "Hospital verification updated"));
});

const verifyNGO = asyncHandler(async (req, res) => {
    const { ngoId } = req.params;
    const { status, remarks, verificationDocuments } = req.body;

    const ngo = await NGO.findById(ngoId);
    if (!ngo) {
        throw new ApiError(404, "NGO not found");
    }

    ngo.isVerified = status === "approved";
    ngo.verificationRemarks = remarks;
    ngo.verificationDocuments = verificationDocuments;
    ngo.verifiedBy = {
        adminId: req.admin._id,
        verifiedAt: new Date(),
    };

    await ngo.save();

    await Activity.create({
        type: "NGO_VERIFICATION",
        performedBy: {
            userId: req.admin._id,
            userModel: "Admin",
        },
        details: {
            ngoId,
            status,
            remarks,
        },
    });

    return res
        .status(200)
        .json(new ApiResponse(200, ngo, "NGO verification updated"));
});

// ANALYTICS & MONITORING
const getSystemAnalytics = asyncHandler(async (req, res) => {
    const [hospitals, ngos, analytics] = await Promise.all([
        Hospital.aggregate([
            {
                $group: {
                    _id: "$isVerified",
                    count: { $sum: 1 },
                    totalRequests: { $sum: "$statistics.totalRequestsMade" },
                    emergencyRequests: {
                        $sum: "$statistics.emergencyRequests",
                    },
                },
            },
        ]),
        NGO.aggregate([
            {
                $group: {
                    _id: "$isVerified",
                    count: { $sum: 1 },
                    totalCamps: { $sum: "$statistics.totalCampsOrganized" },
                    totalDonations: {
                        $sum: "$statistics.totalDonationsCollected",
                    },
                },
            },
        ]),
        Analytics.findOne().sort({ createdAt: -1 }),
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                hospitals,
                ngos,
                analytics,
            },
            "System analytics fetched"
        )
    );
});

// ACTIVITY MONITORING
const getSystemActivities = asyncHandler(async (req, res) => {
    const { startDate, endDate, type } = req.query;

    const query = {};
    if (startDate && endDate) {
        query.createdAt = {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
        };
    }
    if (type) query.type = type;

    const activities = await Activity.find(query)
        .sort({ createdAt: -1 })
        .limit(100);

    return res
        .status(200)
        .json(new ApiResponse(200, activities, "System activities fetched"));
});

export {
    registerAdmin,
    verifyHospital,
    verifyNGO,
    getSystemAnalytics,
    getSystemActivities,
};
