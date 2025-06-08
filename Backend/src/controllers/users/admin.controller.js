import mongoose from "mongoose";
import { Admin } from "../../models/admin.models.js";
import { Hospital } from "../../models/hospital.models.js";
import { NGO } from "../../models/ngo.models.js";
import { Activity } from "../../models/others/activity.model.js";
import { Analytics } from "../../models/others/analytics.model.js";
import { Notification } from "../../models/others/notification.model.js";
import { BloodRequest } from "../../models/donation/bloodrequest.models.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

// Admin Permission Levels
const ADMIN_PERMISSIONS = {
    SUPERADMIN: ["all"],
    ADMIN: ["basic", "verify", "monitor"],
    MODERATOR: ["basic", "monitor"],
};

// 🔐 Authentication Controllers
class AuthController {
    static generateTokens = async (adminId) => {
        try {
            const admin = await Admin.findById(adminId);
            const accessToken = await generateActionToken(admin, "access");
            const refreshToken = await generateActionToken(admin, "refresh");

            admin.refreshToken = refreshToken;
            admin.lastLogin = new Date();
            admin.loginHistory.push({
                timestamp: new Date(),
                success: true,
            });

            await admin.save({ validateBeforeSave: false });
            return { accessToken, refreshToken };
        } catch (error) {
            throw new ApiError(500, "Token generation failed");
        }
    };

    static register = asyncHandler(async (req, res) => {
        const { fullName, email, password, role = "admin" } = req.body;

        // Enhanced validation
        if (!email?.includes("@") || password?.length < 8) {
            throw new ApiError(400, "Invalid email or password too short");
        }

        // Role-based creation logic
        await AuthController.validateRoleCreation(role, req.admin);

        const admin = await Admin.create({
            fullName,
            email,
            password,
            role,
            permissions: ADMIN_PERMISSIONS[role.toUpperCase()],
            createdBy: req.admin?._id,
        });

        // Log activity with enhanced details
        await Activity.create({
            type: "ADMIN_CREATED",
            performedBy: {
                userId: req.admin?._id || admin._id,
                userModel: "Admin",
            },
            details: {
                adminId: admin._id,
                role,
                permissions: admin.permissions,
                createdAt: new Date(),
            },
        });

        return res.status(201).json(
            new ApiResponse(
                201,
                {
                    admin: {
                        _id: admin._id,
                        fullName: admin.fullName,
                        email: admin.email,
                        role: admin.role,
                        permissions: admin.permissions,
                    },
                },
                "Admin registered successfully"
            )
        );
    });

    static login = asyncHandler(async (req, res) => {
        const { email, password } = req.body;

        const admin = await Admin.findOne({ email }).select(
            "+password +loginHistory"
        );
        if (!admin || !(await admin.isPasswordCorrect(password))) {
            await Activity.create({
                type: "FAILED_LOGIN_ATTEMPT",
                details: { email, timestamp: new Date() },
            });
            throw new ApiError(401, "Invalid credentials");
        }

        const { accessToken, refreshToken } =
            await AuthController.generateTokens(admin._id);

        // Cache admin permissions for quick access
        await cacheManager.set(
            `admin:${admin._id}:permissions`,
            admin.permissions
        );

        return res
            .status(200)
            .cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
            })
            .cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
            })
            .json(
                new ApiResponse(
                    200,
                    {
                        admin: {
                            _id: admin._id,
                            fullName: admin.fullName,
                            role: admin.role,
                            permissions: admin.permissions,
                        },
                        tokens: { accessToken, refreshToken },
                    },
                    "Login successful"
                )
            );
    });

    private static async validateRoleCreation(role, requestingAdmin) {
        if (role === "superadmin") {
            const superadminExists = await Admin.findOne({ role: "superadmin" });
            if (superadminExists) {
                throw new ApiError(403, "Superadmin already exists");
            }
        }

        if (
            role === "admin" &&
            (!requestingAdmin || requestingAdmin.role !== "superadmin")
        ) {
            throw new ApiError(403, "Only superadmin can create admins");
        }
    }
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
