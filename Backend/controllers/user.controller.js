import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import User from "../models/user.models.js";
import { Center } from "../models/center.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/fileUpload.js";
import jwt from "jsonwebtoken";
import { sendOTPEmail, generateOTP } from "../utils/emailService.js";
import BloodDonation from "../models/blood.models.js";
import mongoose from "mongoose";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validationBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while genarating refresh and accces token"
    );
  }
};
const registerUser = asyncHandler(async (req, res) => {
  const { 
    fullName, 
    email, 
    password, 
    dateOfBirth,
    bloodType,
    address
  } = req.body;

  if ([fullName, email, password].some((fields) => fields?.trim() === "")) {
    throw new ApiError(400, "all field are required");
  }

  if (!dateOfBirth) {
    throw new ApiError(400, "Date of birth is required");
  }

  // Validate date format and check if it's a valid date
  const dob = new Date(dateOfBirth);
  if (isNaN(dob.getTime())) {
    throw new ApiError(400, "Invalid date format. Please use YYYY-MM-DD format");
  }

  // Check if user is at least 18 years old
  const today = new Date();
  const age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (age < 18 || (age === 18 && monthDiff < 0)) {
    throw new ApiError(400, "You must be at least 18 years old to register");
  }

  // Validate blood type if provided
  if (bloodType) {
    const validBloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
    if (!validBloodTypes.includes(bloodType)) {
      throw new ApiError(400, "Invalid blood type. Must be one of: " + validBloodTypes.join(", "));
    }
  }

  // Validate address if provided
  if (address) {
    if (!address.city || !address.pinCode) {
      throw new ApiError(400, "City and PIN code are required in address");
    }

    // If coordinates are provided, validate them
    if (address.coordinates) {
      if (!Array.isArray(address.coordinates) || 
          address.coordinates.length !== 2 ||
          typeof address.coordinates[0] !== "number" || 
          typeof address.coordinates[1] !== "number") {
        throw new ApiError(400, "Coordinates must be an array of [longitude, latitude]");
      }
    }
  }

  const existedUser = await User.findOne({ email });

  if (existedUser) {
    throw new ApiError(409, "User with email and userName already exists");
  }

  // Generate OTP and set expiry (10 minutes from now)
  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  // Format address with location if coordinates are provided
  const formattedAddress = address ? {
    ...address,
    location: address.coordinates ? {
      type: "Point",
      coordinates: address.coordinates
    } : undefined
  } : undefined;

  const user = await User.create({
    fullName,
    email,
    password,
    dateOfBirth: dob,
    bloodType,
    address: formattedAddress,
    isEmailVerified: false,
    emailVerificationOTP: { code: otp, expiresAt: otpExpiry },
  });

  // Send verification email with OTP
  const emailSent = await sendOTPEmail(email, otp, fullName);

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationOTP"
  );

  if (!createdUser) {
    throw new ApiError(500, "something went wrong while registering user");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        { user: createdUser, emailVerificationSent: emailSent },
        "User registered Successfully. Please verify your email with the OTP sent."
      )
    );
});

/**
  Verify user email with OTP */
const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    throw new ApiError(400, "Email and OTP are required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.isEmailVerified) {
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Email already verified"));
  }

  // Check if OTP is valid and not expired
  if (
    !user.emailVerificationOTP ||
    user.emailVerificationOTP.code !== otp ||
    new Date() > new Date(user.emailVerificationOTP.expiresAt)
  ) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  // Mark user as verified and clear OTP user.
  user.isEmailVerified = true;
  user.emailVerificationOTP = undefined;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Email verified successfully"));
});

/**
  Resend OTP to user email */
const resendEmailOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.isEmailVerified) {
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Email already verified"));
  }

  // Generate new OTP and set expiry
  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  user.emailVerificationOTP = { code: otp, expiresAt: otpExpiry };
  await user.save({ validateBeforeSave: false });

  // Send verification email with new OTP
  const emailSent = await sendOTPEmail(email, otp, user.fullName);

  return res
    .status(200)
    .json(new ApiResponse(200, { emailSent }, "OTP resent successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    throw new ApiError(400, "email is required");
  }

  const user = await User.findOne({
    email,
  });

  if (!user) {
    throw new ApiError(404, "user does not exist");
  }

  if (!user.isEmailVerified) {
    throw new ApiError(403, "Email is not verified. Please verify your email.");
  }

  const isPasswordVaild = await user.isPasswordCorrect(password);

  if (!isPasswordVaild) {
    throw new ApiError(401, "invalid password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "user logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  console.log(req.user._id);
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logged successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incommingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incommingRefreshToken) {
    throw new ApiError(404, "Unauthorized request");
  }
  try {
    const decodedToken = jwt.verify(
      incommingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "invalid refresh Token");
    }

    if (incommingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "refresh token is expried or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newRefreshToken,
          },
          "access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "invalid access token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  // console.log(oldP)
  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "old password is not correct");
  }

  user.password = newPassword;
  await user.save({ validationBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, "password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "-password -refreshToken"
  );

  // console.log(user);

  return res
    .status(200)
    .json(new ApiResponse(200, { user }, " current user fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!(fullName || email)) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        email,
        fullName,
      },
    },
    {
      new: true,
    }
  ).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(500, "internal server error");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "account details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar is required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { avatar: avatar.url },
    { new: true }
  ).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(500, "something went wrong");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "Updated avatar successfully"));
});

const getUserBloodDonationHistory = asyncHandler(async (req, res) => {
  // Get pagination parameters from query
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Get filter parameters
  const { status, bloodGroup, sortBy } = req.query;

  // Build query
  const query = { userId: req.user._id };

  // Add filters if provided
  if (status) {
    query.status = status;
  }

  if (bloodGroup) {
    query.bloodGroup = bloodGroup;
  }

  // Build sort options
  let sortOptions = {};
  if (sortBy === "latest") {
    sortOptions = { donationDate: -1 };
  } else if (sortBy === "oldest") {
    sortOptions = { donationDate: 1 };
  } else {
    // Default sorting
    sortOptions = { donationDate: -1 };
  }

  // Execute query with pagination
  const donations = await BloodDonation.find(query)
    .sort(sortOptions)
    .skip(skip)
    .limit(limit)
    .populate({
      path: "centerId",
      select: "name type location.city location.state",
    })
    .populate({
      path: "ngoId",
      select: "name",
    })
    .populate({
      path: "currentLocation.entityId",
      select: "name",
    });

  // Get total count for pagination
  const totalDonations = await BloodDonation.countDocuments(query);

  // Calculate statistics
  const stats = {
    totalDonations: totalDonations,
    availableDonations: await BloodDonation.countDocuments({
      userId: req.user._id,
      status: "available",
    }),
    usedDonations: await BloodDonation.countDocuments({
      userId: req.user._id,
      status: "used",
    }),
  };

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        donations,
        pagination: {
          totalDonations,
          totalPages: Math.ceil(totalDonations / limit),
          currentPage: page,
          hasNextPage: page * limit < totalDonations,
          hasPrevPage: page > 1,
        },
        stats,
      },
      "Blood donation history fetched successfully"
    )
  );
});

/**
 * Get detailed information about a specific blood donation
 */
const getBloodDonationDetailsByUser = asyncHandler(async (req, res) => {
  const { donationId } = req.params;

  if (!donationId) {
    throw new ApiError(400, "Donation ID is required");
  }

  const donation = await BloodDonation.findById(donationId)
    .populate({
      path: "centerId",
      select: "name type location.city location.state facilities",
    })
    .populate({
      path: "ngoId",
      select: "name contactPerson",
    })
    .populate({
      path: "transferHistory.fromId transferHistory.toId currentLocation.entityId",
      select: "name type",
    });

  if (!donation) {
    throw new ApiError(404, "Donation not found");
  }

  // Verify that the donation belongs to the current user
  if (donation.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You don't have permission to view this donation");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { donation },
        "Blood donation details fetched successfully"
      )
    );
});

/**
 * Get user blood donation statistics
 */
const getUserBloodDonationStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Get overall statistics
  const totalDonations = await BloodDonation.countDocuments({ userId });
  const totalDonationAmount = await BloodDonation.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: null, total: { $sum: "$donationAmount" } } },
  ]);

  // Get blood group distribution
  const bloodGroupStats = await BloodDonation.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: "$bloodGroup", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  // Get donation frequency by month/year
  const donationTimeline = await BloodDonation.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: {
          year: { $year: "$donationDate" },
          month: { $month: "$donationDate" },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  // Format stats
  const formattedStats = {
    totalDonations,
    totalDonationAmount:
      totalDonationAmount.length > 0 ? totalDonationAmount[0].total : 0,
    bloodGroupDistribution: bloodGroupStats.map((item) => ({
      bloodGroup: item._id,
      count: item.count,
    })),
    donationTimeline: donationTimeline.map((item) => ({
      year: item._id.year,
      month: item._id.month,
      count: item.count,
    })),
    statusCounts: {
      available: await BloodDonation.countDocuments({
        userId,
        status: "available",
      }),
      used: await BloodDonation.countDocuments({ userId, status: "used" }),
      processing: await BloodDonation.countDocuments({
        userId,
        status: "processing",
      }),
      expired: await BloodDonation.countDocuments({
        userId,
        status: "expired",
      }),
    },
  };

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        formattedStats,
        "Blood donation statistics fetched successfully"
      )
    );
});

const updateBloodType = asyncHandler(async (req, res) => {
  const { bloodType } = req.body;

  const validBloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  if (!bloodType || !validBloodTypes.includes(bloodType)) {
    throw new ApiError(400, "Invalid or missing blood type");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { bloodType },
    { new: true }
  ).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(500, "Failed to update blood type");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "Blood type updated successfully"));
});

const updateMedicalHistory = asyncHandler(async (req, res) => {
  const { medicalHistory } = req.body;

  if (!medicalHistory) {
    throw new ApiError(400, "Medical history is required");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { medicalHistory },
    { new: true }
  ).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(500, "Failed to update medical history");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, { user }, "Medical history updated successfully")
    );
});

/**
 * Search for nearby blood donation centers where users can donate blood
 */
const findNearbyNGOsForDonation = asyncHandler(async (req, res) => {
  const { distance = 10, bloodGroup } = req.query; // Distance in kilometers

  // Get user's location from their profile
  const user = await User.findById(req.user._id);
  if (!user?.address?.location?.coordinates) {
    throw new ApiError(
      400,
      "User location not set. Please update your profile with your address."
    );
  }

  // Find blood donation centers using geospatial query
  const nearbyCenters = await Center.find({
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: user.address.location.coordinates
        },
        $maxDistance: distance * 1000 // Convert to meters
      }
    },
    type: 'BloodBank', // Match the enum value from the model
    status: 'Active'
  }).select("name type location facilities timing.operationalHours contactPerson");

  // Enhance center data with blood donation information
  const centersWithDonationInfo = await Promise.all(nearbyCenters.map(async (center) => {
    const centerData = center.toObject();

    // Get number of donations processed by this center
    const donationCount = await BloodDonation.countDocuments({
      centerId: center._id,
      status: { $in: ['available', 'used'] }
    });

    return {
      ...centerData,
      donationMetrics: {
        totalDonations: donationCount
      },
      distance: calculateDistance(
        user.address.location.coordinates,
        center.location.coordinates.coordinates
      )
    };
  }));

  // Sort by distance
  centersWithDonationInfo.sort((a, b) => a.distance - b.distance);

  return res.status(200).json(
    new ApiResponse(200, centersWithDonationInfo, "Nearby blood donation centers fetched successfully")
  );
});

// Utility function to calculate distance between two coordinates
function calculateDistance(coords1, coords2) {
  const R = 6371; // Earth's radius in km
  const dLat = deg2rad(coords2[1] - coords1[1]);
  const dLon = deg2rad(coords2[0] - coords1[0]); // Fixed coords0 to coords1
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(coords1[1])) *
      Math.cos(deg2rad(coords2[1])) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Update user's location and address
 */
const updateUserLocation = asyncHandler(async (req, res) => {
  const { street, city, state, pinCode, coordinates } = req.body;

  if (
    !city ||
    !pinCode ||
    !coordinates ||
    !Array.isArray(coordinates) ||
    coordinates.length !== 2
  ) {
    throw new ApiError(
      400,
      "City, pinCode and coordinates [longitude, latitude] are required"
    );
  }

  const [longitude, latitude] = coordinates;
  if (typeof longitude !== "number" || typeof latitude !== "number") {
    throw new ApiError(400, "Coordinates must be numbers");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      address: {
        street,
        city,
        state,
        pinCode,
        location: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "Location updated successfully"));
});

/**
 * Get all blood donation camps
 */
const getAllBloodDonationCamps = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, date, city } = req.query;
  const skip = (page - 1) * limit;

  // Build query
  const query = {
    type: 'DonationCamp',
    status: status || 'Active'
  };

  // // Add date filter if provided
  // if (date) {
  //   const searchDate = new Date(date);
  //   query['timing.campDate'] = {
  //     $gte: new Date(searchDate.setHours(0, 0, 0)),
  //     $lte: new Date(searchDate.setHours(23, 59, 59))
  //   };
  // }

  // Add city filter if provided
  if (city) {
    query['location.city'] = new RegExp(city, 'i');
  }

  // Get user's location for distance calculation
  const user = await User.findById(req.user._id);
  const userCoordinates = user?.address?.location?.coordinates;

  // Execute query with pagination
  const camps = await Center.find(query)
    .sort({ 'timing.campDate': 1 })
    .skip(skip)
    .limit(limit)
    .select('name location facilities timing contactPerson');

  // Get total count for pagination
  const totalCamps = await Center.countDocuments(query);

  // Add distance from user if user location is available
  const campsWithDistance = camps.map(camp => {
    const campData = camp.toObject();
    if (userCoordinates && camp.location?.coordinates?.coordinates) {
      campData.distance = calculateDistance(
        userCoordinates,
        camp.location.coordinates.coordinates
      );
    }
    return campData;
  });

  // Sort by distance if user location is available
  if (userCoordinates) {
    campsWithDistance.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
  }

  // Get upcoming camps count
  const upcomingCampsCount = await Center.countDocuments({
    type: 'DonationCamp',
    status: 'Active',
    'timing.campDate': { $gt: new Date() }
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        camps: campsWithDistance,
        pagination: {
          totalCamps,
          totalPages: Math.ceil(totalCamps / limit),
          currentPage: parseInt(page),
          hasNextPage: skip + camps.length < totalCamps,
          hasPrevPage: page > 1
        },
        stats: {
          totalCamps,
          upcomingCamps: upcomingCampsCount
        }
      },
      "Blood donation camps fetched successfully"
    )
  );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  getBloodDonationDetailsByUser,
  getUserBloodDonationHistory,
  getUserBloodDonationStats,
  verifyEmail,
  resendEmailOTP,
  updateBloodType,
  updateMedicalHistory,
  findNearbyNGOsForDonation,
  updateUserLocation,
  getAllBloodDonationCamps // Add the new controller to exports
};
