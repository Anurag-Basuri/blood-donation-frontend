import mongoose from "mongoose";
import { User } from "../models/user.models.js";
import { BloodDonation } from "../models/blood.models.js";
import { Center } from "../models/center.models.js";
import { DonationAppointment } from "../models/appointment.models.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { uploadFile, deleteFile } from "../../utils/fileUpload.js";
import { sendMail } from "../services/mail.service.js";

// Authentication Controllers
const registerUser = asyncHandler(async (req, res) => {
    const {
        fullName,
        email,
        password,
        dateOfBirth,
        gender,
        phone,
        bloodType,
        address,
    } = req.body;

    // Validate required fields
    if (
        [fullName, email, password, dateOfBirth, gender, phone].some(
            (field) => !field?.trim()
        )
    ) {
        throw new ApiError(400, "All required fields must be provided");
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(409, "User with email already exists");
    }

    // Create user
    const user = await User.create({
        fullName,
        email,
        password,
        dateOfBirth,
        gender,
        phone,
        bloodType,
        address,
    });

    // Generate verification OTP
    const verificationOTP = Math.floor(100000 + Math.random() * 900000);
    user.emailVerificationOTP = {
        code: verificationOTP.toString(),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    };
    await user.save();

    // Send verification email
    await sendMail({
        to: email,
        subject: "Verify Your Email - Blood Donation System",
        html: `Your verification code is: ${verificationOTP}`,
    });

    // Handle profile image upload if provided
    if (req.files?.profileImage) {
        const imageFile = req.files.profileImage;
        const uploadResult = await uploadFile({
            localPath: imageFile.path,
            mimeType: imageFile.mimetype,
            category: "profile",
            entityId: user._id,
        });
        user.profileImage = uploadResult.url;
        await user.save();
    }

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                { user: user.toJSON() },
                "User registered successfully. Please verify your email."
            )
        );
});

// Email Verification
const verifyEmail = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.isEmailVerified) {
        throw new ApiError(400, "Email already verified");
    }

    if (
        !user.emailVerificationOTP ||
        user.emailVerificationOTP.code !== otp ||
        user.emailVerificationOTP.expiresAt < new Date()
    ) {
        throw new ApiError(400, "Invalid or expired OTP");
    }

    user.isEmailVerified = true;
    user.emailVerificationOTP = null;
    await user.save();

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Email verified successfully"));
});

// Login User
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
        throw new ApiError(403, "Account is locked. Try again later");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        return res
            .status(401)
            .json(new ApiResponse(401, null, "Invalid credentials"));
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    user.loginAttempts = 0;
    user.lastLogin = new Date();
    await user.save();

    const loggedInUser = await User.findById(user._id).select("-password");

    return res
        .status(200)
        .cookie("accessToken", accessToken, { httpOnly: true })
        .cookie("refreshToken", refreshToken, { httpOnly: true })
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser, accessToken, refreshToken },
                "Login successful"
            )
        );
});

// Password Management
const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId).select("+password");
    const isPasswordValid = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordValid) {
        throw new ApiError(401, "Current password is incorrect");
    }

    user.password = newPassword;
    await user.save();

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Password changed successfully"));
});

// Profile Management
const updateProfile = asyncHandler(async (req, res) => {
    const { fullName, phone, address, donationPreferences, medicalHistory } =
        req.body;
    const userId = req.user._id;

    // Handle profile image update
    let profileImage;
    if (req.files?.profileImage) {
        const imageFile = req.files.profileImage;
        const uploadResult = await uploadFile({
            localPath: imageFile.path,
            mimeType: imageFile.mimetype,
            category: "profile",
            entityId: userId,
        });
        profileImage = uploadResult.url;

        // Delete old profile image if exists
        const user = await User.findById(userId);
        if (user.profileImage) {
            await deleteFile(user.profileImage);
        }
    }

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
            $set: {
                fullName,
                phone,
                address,
                donationPreferences,
                medicalHistory,
                ...(profileImage && { profileImage }),
            },
        },
        { new: true }
    ).select("-password");

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedUser, "Profile updated successfully")
        );
});

// Donation Eligibility Check
const checkDonationEligibility = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const user = await User.findById(userId);

    // Check age
    const age = new Date().getFullYear() - user.dateOfBirth.getFullYear();
    if (age < 18 || age > 65) {
        throw new ApiError(400, "Age must be between 18 and 65 years");
    }

    // Check last donation date
    if (user.lastDonationDate) {
        const daysSinceLastDonation = Math.floor(
            (new Date() - user.lastDonationDate) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceLastDonation < 56) {
            throw new ApiError(
                400,
                `Must wait ${
                    56 - daysSinceLastDonation
                } more days before next donation`
            );
        }
    }

    // Check medical conditions
    const restrictedConditions = ["HIV", "Hepatitis"];
    const hasRestrictedCondition = user.medicalHistory?.conditions?.some(
        (condition) => restrictedConditions.includes(condition)
    );
    if (hasRestrictedCondition) {
        throw new ApiError(400, "Medical conditions prevent donation");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { isEligible: true, nextEligibleDate: user.nextEligibleDate },
                "User is eligible to donate"
            )
        );
});

// Donation Management
const scheduleDonation = asyncHandler(async (req, res) => {
    const { centerId, date, timeSlot, healthInfo } = req.body;
    const userId = req.user._id;

    // Validate user eligibility with health checks
    const user = await User.findById(userId);
    const eligibilityCheck = await user.checkDonationEligibility();

    if (!eligibilityCheck.isEligible) {
        throw new ApiError(400, `Cannot donate: ${eligibilityCheck.reason}`);
    }

    // Validate health information
    if (healthInfo.hemoglobin < 12.5 || healthInfo.weight < 50) {
        throw new ApiError(400, "Does not meet minimum health requirements");
    }

    // Create appointment with health info
    const appointment = await DonationAppointment.create({
        userId,
        centerId,
        date,
        timeSlot,
        status: "Scheduled",
        healthInformation: {
            ...healthInfo,
            recordedAt: new Date(),
        },
    });

    // Send confirmation email
    await sendMail({
        to: user.email,
        subject: "Donation Appointment Confirmed",
        html: `Your appointment is scheduled for ${new Date(
            date
        ).toLocaleDateString()}`,
    });

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                appointment,
                "Appointment scheduled successfully"
            )
        );
});

// Manage Donation Appointment
const manageDonationAppointment = asyncHandler(async (req, res) => {
    const { action, appointmentId } = req.body;
    const userId = req.user._id;

    const appointment = await DonationAppointment.findOne({
        _id: appointmentId,
        userId,
    });

    if (!appointment) {
        throw new ApiError(404, "Appointment not found");
    }

    switch (action) {
        case "cancel":
            if (!["Scheduled", "Confirmed"].includes(appointment.status)) {
                throw new ApiError(400, "Cannot cancel this appointment");
            }
            appointment.status = "Cancelled";
            appointment.cancellationReason = req.body.reason;
            break;

        case "reschedule":
            const { newDate, newTimeSlot } = req.body;
            if (!newDate || !newTimeSlot) {
                throw new ApiError(400, "New date and time slot required");
            }

            // Verify slot availability
            const center = await Center.findById(appointment.centerId);
            const isSlotAvailable = await center.checkSlotAvailability(
                newDate,
                newTimeSlot
            );

            if (!isSlotAvailable) {
                throw new ApiError(400, "Selected slot is not available");
            }

            appointment.date = newDate;
            appointment.timeSlot = newTimeSlot;
            appointment.status = "Rescheduled";
            break;

        default:
            throw new ApiError(400, "Invalid action");
    }

    await appointment.save();

    // Send email notification
    await sendMail({
        to: req.user.email,
        subject: `Donation Appointment ${
            action.charAt(0).toUpperCase() + action.slice(1)
        }`,
        html: `Your appointment has been ${action}ed. ${
            action === "reschedule"
                ? `New date: ${new Date(appointment.date).toLocaleDateString()}`
                : ""
        }`,
    });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                appointment,
                `Appointment ${action}ed successfully`
            )
        );
});

// Donation Tracking
const trackDonationProgress = asyncHandler(async (req, res) => {
    const { appointmentId } = req.params;
    const userId = req.user._id;

    const appointment = await DonationAppointment.findOne({
        _id: appointmentId,
        userId,
    }).populate("centerId", "name address contactPerson");

    if (!appointment) {
        throw new ApiError(404, "Appointment not found");
    }

    const donationStatus = await BloodDonation.findOne({
        appointmentId: appointment._id,
    }).select("status processingStage expiryDate");

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                appointment,
                donationStatus,
            },
            "Donation progress fetched successfully"
        )
    );
});

// History with Analytics
const getDonationHistory = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const donations = await BloodDonation.find({ userId })
        .populate("centerId", "name address")
        .sort({ donationDate: -1 })
        .limit(limit)
        .skip((page - 1) * limit);

    const stats = await BloodDonation.aggregate([
        { $match: { userId: mongoose.Types.ObjectId(userId) } },
        {
            $group: {
                _id: null,
                totalDonations: { $sum: 1 },
                totalVolume: { $sum: "$donationAmount" },
                averageHemoglobin: { $avg: "$healthMetrics.hemoglobin" },
            },
        },
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                donations,
                stats: stats[0],
                pagination: {
                    currentPage: page,
                    hasMore: donations.length === limit,
                },
            },
            "Donation history fetched successfully"
        )
    );
});

// Find Nearby Centers
const findNearbyCenters = asyncHandler(async (req, res) => {
    const { latitude, longitude, radius = 10 } = req.query;

    const centers = await Center.find({
        "location.coordinates": {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: [parseFloat(longitude), parseFloat(latitude)],
                },
                $maxDistance: radius * 1000, // Convert to meters
            },
        },
        status: "Active",
    }).select("name address location contactPerson");

    return res
        .status(200)
        .json(
            new ApiResponse(200, centers, "Nearby centers fetched successfully")
        );
});

// Emergency Alerts
const toggleEmergencyAlerts = asyncHandler(async (req, res) => {
    const { enabled, bloodGroups } = req.body;
    const userId = req.user._id;

    const user = await User.findByIdAndUpdate(
        userId,
        {
            $set: {
                "donationPreferences.notificationPreferences.emergencyAlerts":
                    enabled,
                "donationPreferences.emergencyBloodGroups": bloodGroups,
            },
        },
        { new: true }
    );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user,
                "Emergency alert preferences updated successfully"
            )
        );
});

export {
    registerUser,
    verifyEmail,
    loginUser,
    changePassword,
    updateProfile,
    checkDonationEligibility,
    scheduleDonation,
    manageDonationAppointment,
    getUpcomingAppointments,
    trackDonationProgress,
    getDonationHistory,
    findNearbyCenters,
    toggleEmergencyAlerts,
};
