import { User } from "../../models/users/user.models.js";
import { Activity } from "../../models/others/activity.model.js";
import { DonationAppointment } from "../../models/donation/appointment.models.js";
import { BloodRequest } from "../../models/donation/bloodrequest.models.js";
import { Center } from "../../models/donation/center.models.js";
import { Notification } from "../../models/others/notification.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

// AUTH CONTROLLERS
const registerUser = asyncHandler(async (req, res) => {
    const {
        fullName,
        email,
        password,
        phone,
        bloodType,
        address,
        dateOfBirth,
    } = req.body;

    // Validate required fields
    if ([fullName, email, password, phone].some((field) => !field?.trim())) {
        throw new ApiError(400, "All required fields must be provided");
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(409, "User with this email already exists");
    }

    // Create user
    const user = await User.create({
        fullName,
        email,
        password,
        phone,
        bloodType,
        address,
        dateOfBirth,
        donorStatus: "Pending",
    });

    // Log activity
    await Activity.create({
        type: "USER_REGISTERED",
        performedBy: {
            userId: user._id,
            userModel: "User",
        },
        details: {
            email: user.email,
        },
    });

    return res
        .status(201)
        .json(new ApiResponse(201, user, "User registered successfully"));
});

// Generate Tokens Helper
const generateTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Token generation failed");
    }
};

// Login Controller
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.isPasswordCorrect(password))) {
        throw new ApiError(401, "Invalid credentials");
    }

    const { accessToken, refreshToken } = await generateTokens(user._id);

    // Log activity
    await Activity.create({
        type: "USER_LOGIN",
        performedBy: {
            userId: user._id,
            userModel: "User",
        },
    });

    return res
        .status(200)
        .cookie("accessToken", accessToken, { httpOnly: true })
        .cookie("refreshToken", refreshToken, { httpOnly: true })
        .json(
            new ApiResponse(
                200,
                { user, tokens: { accessToken, refreshToken } },
                "Login successful"
            )
        );
});

// Logout Controller
const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
        refreshToken: null,
    });

    return res
        .status(200)
        .clearCookie("accessToken")
        .clearCookie("refreshToken")
        .json(new ApiResponse(200, {}, "Logged out successfully"));
});

// Refresh Token Controller
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies?.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Refresh token required");
    }

    const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);
    if (!user || incomingRefreshToken !== user?.refreshToken) {
        throw new ApiError(401, "Invalid refresh token");
    }

    const { accessToken, refreshToken } = await generateTokens(user._id);

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
});

// PROFILE MANAGEMENT
const updateProfile = asyncHandler(async (req, res) => {
    const allowedUpdates = [
        "fullName",
        "phone",
        "address",
        "preferences",
        "emergencyContact",
    ];

    const updates = Object.keys(req.body)
        .filter((key) => allowedUpdates.includes(key))
        .reduce((obj, key) => {
            obj[key] = req.body[key];
            return obj;
        }, {});

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updates },
        { new: true, runValidators: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Profile updated successfully"));
});

// Change Password
const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select("+password");

    if (!(await user.isPasswordCorrect(oldPassword))) {
        throw new ApiError(400, "Invalid old password");
    }

    user.password = newPassword;
    await user.save();

    await Activity.create({
        type: "PASSWORD_CHANGED",
        performedBy: {
            userId: user._id,
            userModel: "User",
        },
    });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"));
});

// DONATION MANAGEMENT
const bookDonationAppointment = asyncHandler(async (req, res) => {
    const { centerId, date, slotTime } = req.body;

    // Check eligibility
    if (!req.user.isEligibleToDonate()) {
        throw new ApiError(400, "You are not eligible to donate at this time");
    }

    // Verify center and slot availability
    const center = await Center.findById(centerId);
    if (!center) {
        throw new ApiError(404, "Donation center not found");
    }

    const appointment = await DonationAppointment.create({
        userId: req.user._id,
        centerId,
        date,
        slotTime,
        status: "Scheduled",
    });

    // Create notification
    await Notification.create({
        type: "APPOINTMENT_CONFIRMATION",
        recipient: req.user._id,
        recipientModel: "User",
        data: {
            date,
            center: center.name,
            message: "Your donation appointment has been scheduled",
        },
    });

    return res
        .status(201)
        .json(
            new ApiResponse(201, appointment, "Appointment booked successfully")
        );
});

// REQUEST MANAGEMENT
const createBloodRequest = asyncHandler(async (req, res) => {
    const { bloodGroups, hospitalId, urgencyLevel, patientInfo, requiredBy } =
        req.body;

    const request = await BloodRequest.create({
        bloodGroups,
        hospitalId,
        urgencyLevel,
        patientInfo,
        requiredBy,
        requesterId: req.user._id,
    });

    // Log activity
    await Activity.create({
        type: "BLOOD_REQUEST_CREATED",
        performedBy: {
            userId: req.user._id,
            userModel: "User",
        },
        details: {
            requestId: request._id,
            bloodGroups,
            urgencyLevel,
        },
    });

    return res
        .status(201)
        .json(
            new ApiResponse(201, request, "Blood request created successfully")
        );
});

// HISTORY & TRACKING
const getDonationHistory = asyncHandler(async (req, res) => {
    const donations = await DonationAppointment.find({
        userId: req.user._id,
        status: "Completed",
    })
        .sort({ date: -1 })
        .populate("centerId", "name address");

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                donations,
                "Donation history fetched successfully"
            )
        );
});

const getRequestHistory = asyncHandler(async (req, res) => {
    const requests = await BloodRequest.find({
        requesterId: req.user._id,
    })
        .sort({ createdAt: -1 })
        .populate("hospitalId", "name address");

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                requests,
                "Request history fetched successfully"
            )
        );
});

// NOTIFICATIONS
const getNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.find({
        recipient: req.user._id,
        status: { $ne: "READ" },
    }).sort({ createdAt: -1 });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                notifications,
                "Notifications fetched successfully"
            )
        );
});

const markNotificationsRead = asyncHandler(async (req, res) => {
    await Notification.markAllAsRead(req.user._id);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "All notifications marked as read"));
});

// Get Current User
const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
        .select("-password -refreshToken")
        .populate("donations", "date status")
        .populate("requests", "bloodGroups status createdAt");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User details fetched"));
});

// Update Emergency Contact
const updateEmergencyContact = asyncHandler(async (req, res) => {
    const { name, relationship, phone, address } = req.body;

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                emergencyContact: { name, relationship, phone, address },
            },
        },
        { new: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Emergency contact updated"));
});

export {
    registerUser,
    updateProfile,
    bookDonationAppointment,
    createBloodRequest,
    getDonationHistory,
    getRequestHistory,
    getNotifications,
    markNotificationsRead,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changePassword,
    getCurrentUser,
    updateEmergencyContact,
};
