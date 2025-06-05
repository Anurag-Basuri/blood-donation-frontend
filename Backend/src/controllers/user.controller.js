import { User } from "../models/user.models.js";
import { BloodDonation } from "../models/blood.models.js";
import { Center } from "../models/center.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
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

    return res.status(201).json(
        new ApiResponse(
            201,
            {
                user: user.toJSON(),
            },
            "User registered successfully. Please verify your email."
        )
    );
});

// User Login Controller
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
    }

    if (!user.isEmailVerified) {
        throw new ApiError(403, "Please verify your email first");
    }

    const { accessToken, refreshToken } = await user.generateTokens();

    const loggedInUser = await User.findById(user._id).select("-password");

    return res
        .status(200)
        .cookie("accessToken", accessToken, { httpOnly: true })
        .cookie("refreshToken", refreshToken, { httpOnly: true })
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                "User logged in successfully"
            )
        );
});

// Profile Management
const updateProfile = asyncHandler(async (req, res) => {
    const { fullName, phone, address, donationPreferences } = req.body;

    const userId = req.user._id;

    const user = await User.findByIdAndUpdate(
        userId,
        {
            $set: {
                fullName,
                phone,
                address,
                donationPreferences,
            },
        },
        { new: true }
    ).select("-password");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Profile updated successfully"));
});

// Donation Management
const scheduleDonation = asyncHandler(async (req, res) => {
    const { centerId, date, timeSlot } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user.isEligibleToDonate()) {
        throw new ApiError(400, "You are not eligible to donate at this time");
    }

    const center = await Center.findById(centerId);
    if (!center) {
        throw new ApiError(404, "Donation center not found");
    }

    // Check slot availability
    const isSlotAvailable = await center.checkSlotAvailability(date, timeSlot);
    if (!isSlotAvailable) {
        throw new ApiError(400, "Selected time slot is not available");
    }

    const appointment = await DonationAppointment.create({
        userId,
        centerId,
        date,
        timeSlot,
        status: "Scheduled",
    });

    // Update center slot
    await center.bookSlot(date, timeSlot);

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                appointment,
                "Donation appointment scheduled successfully"
            )
        );
});

// Donation History
const getDonationHistory = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const donations = await BloodDonation.find({ userId })
        .populate("centerId", "name address")
        .sort({ donationDate: -1 });

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
    loginUser,
    updateProfile,
    scheduleDonation,
    getDonationHistory,
    findNearbyCenters,
    toggleEmergencyAlerts,
};
