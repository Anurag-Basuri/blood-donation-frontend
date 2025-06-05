import { User } from "../models/user.models.js";
import { BloodDonation } from "../models/blood.models.js";
import { Center } from "../models/center.models.js";
import { DonationAppointment } from "../models/appointment.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadFile, deleteFile } from "../utils/fileUpload.js";
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

// Enhanced Profile Management
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

// Enhanced Donation Management
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

// Enhanced History with Analytics
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
    scheduleDonation,
    trackDonationProgress,
    getDonationHistory,
    findNearbyCenters,
    toggleEmergencyAlerts,
};
