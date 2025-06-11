import mongoose from "mongoose";
import { Hospital } from "../../models/users/hospital.models.js";
import { BloodRequest } from "../../models/donation/bloodrequest.models.js";
import { NGO } from "../../models/users/ngo.models.js";
import { Activity } from "../../models/others/activity.model.js";
import { Notification } from "../../models/others/notification.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { uploadFile } from "../../utils/fileUpload.js";

// AUTH CONTROLLERS
const registerHospital = asyncHandler(async (req, res) => {
    const {
        name,
        email,
        password,
        registrationNumber,
        address,
        contactPerson,
        type,
        specialties,
        emergencyContact,
    } = req.body;

    // Validate required fields
    if (
        [name, email, password, registrationNumber].some(
            (field) => !field?.trim()
        )
    ) {
        throw new ApiError(400, "Required fields missing");
    }

    const existingHospital = await Hospital.findOne({
        $or: [{ email }, { registrationNumber }],
    });

    if (existingHospital) {
        throw new ApiError(409, "Hospital already registered");
    }

    // Upload and validate documents
    let documents = {};
    if (req.files) {
        if (req.files.license) {
            documents.license = await uploadFile({
                file: req.files.license,
                folder: "hospital-documents/licenses",
            });
        }
        if (req.files.accreditation) {
            documents.accreditation = await uploadFile({
                file: req.files.accreditation,
                folder: "hospital-documents/accreditation",
            });
        }
    }

    const hospital = await Hospital.create({
        name,
        email,
        password,
        registrationNumber,
        address,
        contactPerson,
        type,
        specialties,
        emergencyContact,
        documents,
        verificationStatus: "PENDING",
    });

    // Log activity
    await Activity.create({
        type: "HOSPITAL_REGISTERED",
        performedBy: {
            userId: hospital._id,
            userModel: "Hospital",
        },
        details: {
            hospitalId: hospital._id,
            name: hospital.name,
        },
    });

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                hospital,
                "Hospital registration pending verification"
            )
        );
});

// Generate Auth Tokens
const generateTokens = async (hospitalId) => {
    try {
        const hospital = await Hospital.findById(hospitalId);
        const accessToken = hospital.generateAccessToken();
        const refreshToken = hospital.generateRefreshToken();

        hospital.refreshToken = refreshToken;
        hospital.lastLogin = new Date();
        await hospital.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Token generation failed");
    }
};

// Login Controller
const loginHospital = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    // Find hospital with password
    const hospital = await Hospital.findOne({ email }).select("+password");

    if (!hospital || !(await hospital.comparePassword(password))) {
        throw new ApiError(401, "Invalid credentials");
    }

    // Check verification status
    if (!hospital.isVerified) {
        throw new ApiError(403, "Hospital not verified. Please contact admin");
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateTokens(hospital._id);

    // Log activity
    await Activity.create({
        type: "HOSPITAL_LOGIN",
        performedBy: {
            userId: hospital._id,
            userModel: "Hospital",
        },
        details: {
            loginTime: new Date(),
            ipAddress: req.ip,
        },
    });

    return res
        .status(200)
        .cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        })
        .cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        })
        .json(
            new ApiResponse(
                200,
                {
                    hospital: {
                        _id: hospital._id,
                        name: hospital.name,
                        email: hospital.email,
                        isVerified: hospital.isVerified,
                        type: hospital.type,
                        address: hospital.address,
                    },
                    tokens: { accessToken, refreshToken },
                },
                "Login successful"
            )
        );
});

// Logout Controller
const logoutHospital = asyncHandler(async (req, res) => {
    await Hospital.findByIdAndUpdate(
        req.hospital._id,
        {
            $set: { refreshToken: null },
        },
        { new: true }
    );

    // Log activity
    await Activity.create({
        type: "HOSPITAL_LOGOUT",
        performedBy: {
            userId: req.hospital._id,
            userModel: "Hospital",
        },
    });

    return res
        .status(200)
        .clearCookie("accessToken")
        .clearCookie("refreshToken")
        .json(new ApiResponse(200, {}, "Logged out successfully"));
});

// Change Password
const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
        throw new ApiError(400, "Current and new passwords are required");
    }

    const hospital = await Hospital.findById(req.hospital._id).select(
        "+password"
    );

    // Check current password
    if (!(await hospital.comparePassword(currentPassword))) {
        throw new ApiError(401, "Current password is incorrect");
    }

    // Update password
    hospital.password = newPassword;
    await hospital.save();

    // Log activity
    await Activity.create({
        type: "HOSPITAL_PASSWORD_CHANGED",
        performedBy: {
            userId: hospital._id,
            userModel: "Hospital",
        },
    });

    return res.status(200).json(
        new ApiResponse(200, {}, "Password changed successfully")
    );
});

// Refresh Token
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies?.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Refresh token required");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const hospital = await Hospital.findById(decodedToken?._id);
        if (!hospital || incomingRefreshToken !== hospital?.refreshToken) {
            throw new ApiError(401, "Invalid refresh token");
        }

        const { accessToken, refreshToken } = await generateTokens(
            hospital._id
        );

        return res
            .status(200)
            .cookie("accessToken", accessToken, { httpOnly: true })
            .cookie("refreshToken", refreshToken, { httpOnly: true })
            .json(
                new ApiResponse(
                    200,
                    { tokens: { accessToken, refreshToken } },
                    "Access token refreshed"
                )
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});

// BLOOD REQUEST MANAGEMENT
const createBloodRequest = asyncHandler(async (req, res) => {
    const { bloodGroups, urgencyLevel, requiredBy, patientInfo } = req.body;
    const hospitalId = req.hospital._id;

    const bloodRequest = await BloodRequest.create({
        hospitalId,
        bloodGroups,
        urgencyLevel,
        requiredBy,
        patientInfo,
        status: "PENDING",
    });

    // Update hospital statistics
    await Hospital.findByIdAndUpdate(hospitalId, {
        $inc: {
            "statistics.totalRequestsMade": 1,
            "statistics.emergencyRequests":
                urgencyLevel === "Emergency" ? 1 : 0,
        },
        $set: { "statistics.lastRequestDate": new Date() },
    });

    // Find and notify nearby NGOs
    const hospital = await Hospital.findById(hospitalId);
    const nearbyNGOs = await hospital.findNearbyNGOs(50000); // 50km radius

    await Promise.all(
        nearbyNGOs.map((ngo) =>
            Notification.create({
                type: "URGENT_BLOOD_REQUEST",
                recipient: ngo._id,
                recipientModel: "NGO",
                data: {
                    requestId: bloodRequest._id,
                    bloodGroups,
                    hospitalName: hospital.name,
                    urgencyLevel,
                },
            })
        )
    );

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                bloodRequest,
                "Blood request created successfully"
            )
        );
});

// INVENTORY MANAGEMENT
const updateBloodInventory = asyncHandler(async (req, res) => {
    const { bloodGroup, operation, units, source } = req.body;
    const hospitalId = req.hospital._id;

    const hospital = await Hospital.findById(hospitalId);

    // Validate operation
    if (!["add", "deduct"].includes(operation)) {
        throw new ApiError(400, "Invalid operation");
    }

    // Update inventory
    await hospital.updateBloodInventory(
        bloodGroup,
        operation === "add" ? units : -units
    );

    // Log activity
    await Activity.create({
        type: "INVENTORY_UPDATED",
        performedBy: {
            userId: hospitalId,
            userModel: "Hospital",
        },
        details: {
            bloodGroup,
            operation,
            units,
            source,
        },
    });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { inventory: hospital.bloodInventory },
                "Inventory updated successfully"
            )
        );
});

// NGO NETWORK MANAGEMENT
const manageNGOConnections = asyncHandler(async (req, res) => {
    const { ngoId, action } = req.params;
    const { priority, notes } = req.body;
    const hospitalId = req.hospital._id;

    const hospital = await Hospital.findById(hospitalId);
    const connection = hospital.connectedNGOs.find(
        (conn) => conn.ngoId.toString() === ngoId
    );

    switch (action) {
        case "connect":
            if (connection) {
                throw new ApiError(400, "Already connected with this NGO");
            }
            hospital.connectedNGOs.push({
                ngoId,
                status: "PENDING",
                priority: priority || 3,
                connectedDate: new Date(),
            });
            break;

        case "update":
            if (!connection) {
                throw new ApiError(404, "Connection not found");
            }
            Object.assign(connection, {
                priority,
                notes,
                lastUpdated: new Date(),
            });
            break;

        case "disconnect":
            if (!connection) {
                throw new ApiError(404, "Connection not found");
            }
            connection.status = "DISCONNECTED";
            connection.disconnectedAt = new Date();
            connection.disconnectionReason = notes;
            break;

        default:
            throw new ApiError(400, "Invalid action");
    }

    await hospital.save();

    // Notify NGO
    await Notification.create({
        type: `NGO_CONNECTION_${action.toUpperCase()}`,
        recipient: ngoId,
        recipientModel: "NGO",
        data: {
            hospitalId: hospital._id,
            hospitalName: hospital.name,
            action,
            notes,
        },
    });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { hospital },
                "NGO connection updated successfully"
            )
        );
});

// ANALYTICS & REPORTS
const getHospitalAnalytics = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const hospitalId = req.hospital._id;

    const [requests, inventory, ngoTransactions] = await Promise.all([
        BloodRequest.aggregate([
            {
                $match: {
                    hospitalId: mongoose.Types.ObjectId(hospitalId),
                    createdAt: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate),
                    },
                },
            },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                    emergencyCount: {
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
        Hospital.findById(hospitalId).select("bloodInventory"),
        Activity.find({
            "performedBy.userId": hospitalId,
            type: { $in: ["BLOOD_RECEIVED", "BLOOD_ISSUED"] },
            createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
        }).sort({ createdAt: -1 }),
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                requests,
                inventory: inventory.bloodInventory,
                transactions: ngoTransactions,
            },
            "Analytics fetched successfully"
        )
    );
});

// FIND NEARBY NGOs
const findNearbyNGOs = asyncHandler(async (req, res) => {
    const { latitude, longitude, radius = 50000 } = req.query; // Default radius 50km

    if (!latitude || !longitude) {
        throw new ApiError(400, "Latitude and longitude are required");
    }

    const nearbyNGOs = await NGO.find({
        location: {
            $geoWithin: {
                $centerSphere: [[longitude, latitude], radius / 6378.1], // Radius in radians
            },
        },
    });

    return res.status(200).json(
        new ApiResponse(200, nearbyNGOs, "Nearby NGOs fetched successfully")
    );
});

// GET HOSPITAL PROFILE
const getHospitalProfile = asyncHandler(async (req, res) => {
    const hospitalId = req.hospital._id;

    const hospital = await Hospital.findById(hospitalId)
        .select("-password -refreshToken")
        .populate("connectedNGOs.ngoId", "name email type");

    if (!hospital) {
        throw new ApiError(404, "Hospital not found");
    }

    return res.status(200).json(
        new ApiResponse(200, hospital, "Hospital profile fetched successfully")
    );
});

export {
    registerHospital,
    createBloodRequest,
    updateBloodInventory,
    manageNGOConnections,
    getHospitalAnalytics,
    loginHospital,
    logoutHospital,
    refreshAccessToken,
    changePassword,
    findNearbyNGOs,
    getHospitalProfile,
    updateEmergencyContact,
    updateHospitalProfile,
};
