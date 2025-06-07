import { Admin } from "../../models/admin.models.js";
import { Hospital } from "../../models/hospital.models.js";
import { NGO } from "../../models/ngo.models.js";
import { Activity } from "../../models/others/activity.model.js";
import { Analytics } from "../../models/others/analytics.model.js";
import { Notification } from "../../models/others/notification.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

// 🔐 Authentication Controllers
class AuthController {
    static generateTokens = async (adminId) => {
        try {
            const admin = await Admin.findById(adminId);
            const accessToken = admin.generateAccessToken();
            const refreshToken = admin.generateRefreshToken();

            admin.refreshToken = refreshToken;
            admin.lastLogin = new Date();
            await admin.save({ validateBeforeSave: false });

            return { accessToken, refreshToken };
        } catch (error) {
            throw new ApiError(500, "Token generation failed");
        }
    };

    static register = asyncHandler(async (req, res) => {
        const { fullName, email, password, role = "admin" } = req.body;

        // Superadmin validation
        if (role === "superadmin") {
            const superadminExists = await Admin.findOne({
                role: "superadmin",
            });
            if (superadminExists) {
                throw new ApiError(403, "Superadmin already exists");
            }
        }

        // Regular admin creation requires superadmin
        if (
            role === "admin" &&
            (!req.admin || req.admin.role !== "superadmin")
        ) {
            throw new ApiError(403, "Only superadmin can create admins");
        }

        // Create admin
        const admin = await Admin.create({
            fullName,
            email,
            password,
            role,
            permissions: role === "superadmin" ? ["all"] : ["basic"],
        });

        // Log activity
        await Activity.create({
            type: "ADMIN_CREATED",
            performedBy: {
                userId: req.admin?._id || admin._id,
                userModel: "Admin",
            },
            details: { adminId: admin._id, role },
        });

        return res
            .status(201)
            .json(new ApiResponse(201, admin, "Admin registered successfully"));
    });

    static login = asyncHandler(async (req, res) => {
        const { email, password } = req.body;

        const admin = await Admin.findByEmailWithPassword(email);
        if (!admin || !(await admin.isPasswordCorrect(password))) {
            throw new ApiError(401, "Invalid credentials");
        }

        const { accessToken, refreshToken } =
            await AuthController.generateTokens(admin._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, { httpOnly: true })
            .cookie("refreshToken", refreshToken, { httpOnly: true })
            .json(
                new ApiResponse(
                    200,
                    { admin, tokens: { accessToken, refreshToken } },
                    "Login successful"
                )
            );
    });
}

// 🏥 Verification Controllers
class VerificationController {
    static verifyHospital = asyncHandler(async (req, res) => {
        const { hospitalId } = req.params;
        const { status, remarks, verificationDocuments } = req.body;

        const hospital = await Hospital.findById(hospitalId);
        if (!hospital) {
            throw new ApiError(404, "Hospital not found");
        }

        // Update verification status
        hospital.isVerified = status === "approved";
        hospital.verificationRemarks = remarks;
        hospital.verificationDocuments = verificationDocuments;
        hospital.verifiedBy = {
            adminId: req.admin._id,
            verifiedAt: new Date(),
        };

        await hospital.save();

        // Create activity log
        await Activity.create({
            type: "HOSPITAL_VERIFICATION",
            performedBy: { userId: req.admin._id, userModel: "Admin" },
            details: { hospitalId, status, remarks },
        });

        // Send notification to hospital
        await Notification.create({
            type:
                status === "approved"
                    ? "VERIFICATION_APPROVED"
                    : "VERIFICATION_REJECTED",
            recipient: hospital._id,
            recipientModel: "Hospital",
            data: {
                status,
                remarks,
                verifiedBy: req.admin.fullName,
            },
        });

        return res
            .status(200)
            .json(
                new ApiResponse(200, hospital, "Hospital verification updated")
            );
    });

    static verifyNGO = asyncHandler(async (req, res) => {
        const { ngoId } = req.params;
        const { status, remarks, verificationDocuments } = req.body;

        const ngo = await NGO.findById(ngoId);
        if (!ngo) {
            throw new ApiError(404, "NGO not found");
        }

        // Update verification status
        ngo.isVerified = status === "approved";
        ngo.verificationRemarks = remarks;
        ngo.verificationDocuments = verificationDocuments;
        ngo.verifiedBy = {
            adminId: req.admin._id,
            verifiedAt: new Date(),
        };

        await ngo.save();

        // Create activity log
        await Activity.create({
            type: "NGO_VERIFICATION",
            performedBy: { userId: req.admin._id, userModel: "Admin" },
            details: { ngoId, status, remarks },
        });

        // Send notification to NGO
        await Notification.create({
            type:
                status === "approved"
                    ? "VERIFICATION_APPROVED"
                    : "VERIFICATION_REJECTED",
            recipient: ngo._id,
            recipientModel: "NGO",
            data: {
                status,
                remarks,
                verifiedBy: req.admin.fullName,
            },
        });

        return res
            .status(200)
            .json(new ApiResponse(200, ngo, "NGO verification updated"));
    });
}

// 📊 Analytics Controllers
class AnalyticsController {
    static getSystemAnalytics = asyncHandler(async (req, res) => {
        const [hospitals, ngos, analytics, urgentRequests] = await Promise.all([
            Hospital.aggregate([
                {
                    $group: {
                        _id: "$isVerified",
                        count: { $sum: 1 },
                        totalRequests: {
                            $sum: "$statistics.totalRequestsMade",
                        },
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
            BloodRequest.find({
                urgencyLevel: "Emergency",
                status: { $nin: ["Completed", "Cancelled"] },
            }).count(),
        ]);

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    hospitals,
                    ngos,
                    analytics,
                    urgentRequests,
                    systemHealth: {
                        status: "Operational",
                        lastChecked: new Date(),
                        activeUsers: await getActiveUsers(),
                    },
                },
                "System analytics fetched"
            )
        );
    });

    static getActivityLogs = asyncHandler(async (req, res) => {
        const { startDate, endDate, type, page = 1, limit = 100 } = req.query;

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
            .skip((page - 1) * limit)
            .limit(limit);

        const totalCount = await Activity.countDocuments(query);

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    activities,
                    pagination: {
                        currentPage: page,
                        totalPages: Math.ceil(totalCount / limit),
                        totalItems: totalCount,
                    },
                },
                "Activity logs fetched"
            )
        );
    });
}

// Export controllers
export const { register: registerAdmin, login: loginAdmin } = AuthController;

export const { verifyHospital, verifyNGO } = VerificationController;

export const { getSystemAnalytics, getActivityLogs: getSystemActivities } =
    AnalyticsController;
