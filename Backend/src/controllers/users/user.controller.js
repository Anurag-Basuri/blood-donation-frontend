import { User } from "../../models/users/user.models.js";
import { Activity } from "../../models/others/activity.model.js";
import { DonationAppointment } from "../../models/donation/appointment.models.js";
import { BloodRequest } from "../../models/donation/bloodrequest.models.js";
import { Facility } from "../../models/donation/facility.models.js";
import { Notification } from "../../models/others/notification.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

// Constants
const ALLOWED_PROFILE_UPDATES = [
    "fullName",
    "phone",
    "address",
    "preferences",
    "emergencyContact",
    "medicalInfo",
];

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
        medicalInfo,
    } = req.body;

    // Enhanced validation
    const validations = [
        { condition: !fullName?.trim(), message: "Full name is required" },
        { condition: !email?.trim(), message: "Email is required" },
        { condition: !password?.trim(), message: "Password is required" },
        { condition: !phone?.trim(), message: "Phone number is required" },
        {
            condition: phone && !/^\+?[\d\s-]{10,}$/.test(phone),
            message: "Invalid phone number format",
        },
        {
            condition:
                email &&
                !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/.test(email),
            message: "Invalid email format",
        },
    ];

    const failedValidation = validations.find((v) => v.condition);
    if (failedValidation) {
        throw new ApiError(400, failedValidation.message);
    }

    // Check existing user
    const existingUser = await User.findOne({
        $or: [{ email }, { phone }],
    });

    if (existingUser) {
        throw new ApiError(
            409,
            existingUser.email === email
                ? "Email already registered"
                : "Phone number already registered"
        );
    }

    // Create user with enhanced details
    const user = await User.create({
        fullName,
        email,
        password,
        phone,
        bloodType,
        address,
        dateOfBirth,
        medicalInfo,
        donorStatus: "PENDING",
        verificationStatus: "UNVERIFIED",
        lastHealthCheck: medicalInfo?.lastCheckup || null,
        registrationIP: req.ip,
        deviceInfo: req.headers["user-agent"],
    });

    // Log activity with detailed tracking
    await Activity.create({
        type: "USER_REGISTERED",
        performedBy: {
            userId: user._id,
            userModel: "User",
        },
        details: {
            email: user.email,
            registrationIP: req.ip,
            deviceInfo: req.headers["user-agent"],
            timestamp: new Date(),
        },
    });

    // Send welcome notification
    await Notification.create({
        type: "WELCOME",
        recipient: user._id,
        recipientModel: "User",
        data: {
            name: user.fullName,
            nextSteps: [
                "Complete your profile",
                "Schedule your first donation",
                "Join our community",
            ],
        },
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            {
                user: {
                    _id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    donorStatus: user.donorStatus,
                },
            },
            "Registration successful. Please verify your email."
        )
    );
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
    const updates = Object.keys(req.body)
        .filter((key) => ALLOWED_PROFILE_UPDATES.includes(key))
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
    const { facilityId, date, slotTime, donationType } = req.body;

    // Enhanced eligibility check
    const eligibility = await req.user.checkDonationEligibility();
    if (!eligibility.isEligible) {
        throw new ApiError(
            400,
            `Not eligible to donate: ${eligibility.reason}`
        );
    }

    // Verify facility and slot
    const facility = await Facility.findById(facilityId);
    if (!facility) {
        throw new ApiError(404, "Donation facility not found");
    }

    // Check facility schedule
    if (facility.facilityType === "CAMP") {
        const campDate = new Date(date).setHours(0, 0, 0, 0);
        const startDate = new Date(facility.schedule.startDate).setHours(
            0,
            0,
            0,
            0
        );
        const endDate = new Date(facility.schedule.endDate).setHours(
            23,
            59,
            59,
            999
        );

        if (campDate < startDate || campDate > endDate) {
            throw new ApiError(400, "Selected date is outside camp schedule");
        }
    }

    // Verify slot availability
    const isSlotAvailable = await facility.checkSlotAvailability(
        date,
        slotTime
    );
    if (!isSlotAvailable) {
        throw new ApiError(400, "Selected time slot is not available");
    }

    // Create appointment with enhanced tracking
    const appointment = await DonationAppointment.create({
        userId: req.user._id,
        facilityId,
        date,
        slotTime,
        donationType,
        status: "SCHEDULED",
        healthInfo: req.user.medicalInfo,
        previousDonations: await req.user.getDonationCount(),
        specialNotes: req.user.medicalConditions,
    });

    // Reserve slot
    await facility.reserveSlot(date, slotTime);

    // Send confirmation notification with reminders
    await Notification.create({
        type: "APPOINTMENT_CONFIRMATION",
        recipient: req.user._id,
        recipientModel: "User",
        data: {
            appointmentId: appointment._id,
            facility: facility.name,
            date,
            slotTime,
            preparationSteps: [
                "Get adequate sleep",
                "Eat within 3 hours",
                "Bring valid ID",
                "Wear comfortable clothing",
            ],
            directions: await facility.getDirections(
                req.user.address?.location
            ),
        },
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            {
                appointment,
                facility: {
                    name: facility.name,
                    address: facility.contactInfo.address,
                    contact: facility.contactInfo.person,
                },
            },
            "Appointment scheduled successfully"
        )
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

// Get Request History
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

// Mark Notifications as Read
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
    loginUser,
    logoutUser,
    refreshAccessToken,
    updateProfile,
    bookDonationAppointment,
    createBloodRequest,
    getDonationHistory,
    getRequestHistory,
    getNotifications,
    markNotificationsRead,
    getCurrentUser,
    updateEmergencyContact,
    changePassword,
};
