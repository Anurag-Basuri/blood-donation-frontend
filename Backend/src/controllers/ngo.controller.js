import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import NGO from "../models/ngo.models.js";
import jwt from "jsonwebtoken";
import { uploadOnCloudinary } from "../utils/fileUpload.js";
import { sendOTPEmail } from "../utils/emailService.js";

/**
 * Generate access and refresh tokens for NGO
 */
const generateTokens = async (ngoId) => {
  try {
    const ngo = await NGO.findById(ngoId);
    
    // Generate access token
    const accessToken = jwt.sign(
      {
        _id: ngo._id,
        name: ngo.name,
        email: ngo.email,
        role: "ngo"
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
    
    // Generate refresh token
    const refreshToken = jwt.sign(
      { _id: ngo._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
    
    // Save refresh token to NGO document
    ngo.refreshToken = refreshToken;
    await ngo.save({ validateBeforeSave: false });
    
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Error generating tokens");
  }
};

/**
 * Register a new NGO
 */
const registerNGO = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    contactPerson,
    address,
    affiliation,
    regNumber
  } = req.body;
  
  // Validate required fields
  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email and password are required");
  }
  
  // Check if NGO already exists
  const existingNGO = await NGO.findOne({ email });
  if (existingNGO) {
    throw new ApiError(409, "NGO with this email already exists");
  }
  
  // Upload logo if provided
  let logoUrl = "";
  if (req.files && req.files.logo) {
    const logoFile = await uploadOnCloudinary(req.files.logo[0].path);
    if (logoFile) {
      logoUrl = logoFile.url;
    }
  }
  
  // Create new NGO
  const ngo = await NGO.create({
    name,
    email,
    password, // Will be hashed by mongoose-bcrypt plugin
    contactPerson,
    address,
    affiliation: affiliation || 'Independent',
    regNumber,
    isVerified: false, // Will be verified later
    logo: logoUrl
  });
  
  // Generate OTP for verification
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date();
  otpExpiry.setHours(otpExpiry.getHours() + 1); // OTP valid for 1 hour
  
  ngo.verificationOTP = {
    code: otp,
    expiresAt: otpExpiry
  };
  
  await ngo.save();
  
  // TODO: Send verification email with OTP
  await sendOTPEmail(ngo.email, otp);
  
  // Return success response without sensitive information
  const ngoData = await NGO.findById(ngo._id).select("-password -refreshToken -verificationOTP");
  
  return res.status(201).json(
    new ApiResponse(201, ngoData, "NGO registered successfully. Please verify your email.")
  );
});

/**
 * Verify NGO email with OTP
 */
const verifyNGOEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  
  if (!email || !otp) {
    throw new ApiError(400, "Email and OTP are required");
  }
  
  const ngo = await NGO.findOne({ email });
  
  if (!ngo) {
    throw new ApiError(404, "NGO not found");
  }
  
  if (ngo.isVerified) {
    return res.status(200).json(
      new ApiResponse(200, {}, "NGO is already verified")
    );
  }
  
  // Check if OTP is valid and not expired
  if (!ngo.verificationOTP || 
      ngo.verificationOTP.code !== otp || 
      new Date() > new Date(ngo.verificationOTP.expiresAt)) {
    throw new ApiError(400, "Invalid or expired OTP");
  }
  
  // Mark NGO as verified
  ngo.isVerified = true;
  ngo.verificationOTP = undefined; // Clear OTP after verification
  await ngo.save();
  
  return res.status(200).json(
    new ApiResponse(200, {}, "NGO verified successfully")
  );
});

// /**
//  * Request a new OTP if previous one expired
//  */
// const requestNewOTP = asyncHandler(async (req, res) => {
//   const { email } = req.body;
  
//   if (!email) {
//     throw new ApiError(400, "Email is required");
//   }
  
//   const ngo = await NGO.findOne({ email });
  
//   if (!ngo) {
//     throw new ApiError(404, "NGO not found");
//   }
  
//   if (ngo.isVerified) {
//     return res.status(200).json(
//       new ApiResponse(200, {}, "NGO is already verified")
//     );
//   }
  
//   // Generate new OTP
//   const otp = Math.floor(100000 + Math.random() * 900000).toString();
//   const otpExpiry = new Date();
//   otpExpiry.setHours(otpExpiry.getHours() + 1); // OTP valid for 1 hour
  
//   ngo.verificationOTP = {
//     code: otp,
//     expiresAt: otpExpiry
//   };
  
//   await ngo.save();
  
//   // TODO: Send verification email with OTP
//   await sendOTPEmail(ngo.email, otp);

  
//   return res.status(200).json(
//     new ApiResponse(200, {}, "New OTP sent to your email")
//   );
// });

/**
 * Resend verification email
 */
const resendVerificationOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const ngo = await NGO.findOne({ email });

  if (!ngo) {
    throw new ApiError(404, "NGO not found");
  }

  if (ngo.isVerified) {
    return res.status(200).json(
      new ApiResponse(200, {}, "NGO is already verified")
    );
  }

  // Generate new OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date();
  otpExpiry.setHours(otpExpiry.getHours() + 1); // OTP valid for 1 hour

  ngo.verificationOTP = {
    code: otp,
    expiresAt: otpExpiry
  };

  await ngo.save();

  // Send verification email
  await sendOTPEmail(ngo.email, otp);

  return res.status(200).json(
    new ApiResponse(200, {}, "Verification email resent successfully")
  );
});

/**
 * Login NGO
 */
const loginNGO = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }
  
  // Find NGO
  const ngo = await NGO.findOne({ email });
  
  if (!ngo) {
    throw new ApiError(404, "NGO not found");
  }
  
  // Check if NGO is verified
  if (!ngo.isVerified) {
    throw new ApiError(401, "Please verify your email first");
  }
  
  // Verify password - mongoose-bcrypt plugin adds this method
  const isPasswordValid = await ngo.verifyPassword(password);
  
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }
  
  // Generate tokens
  const { accessToken, refreshToken } = await generateTokens(ngo._id);
  
  // Get NGO data without sensitive information
  const ngoData = await NGO.findById(ngo._id)
    .select("-password -verificationOTP");
  
  // Set cookies
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production"
  };
  
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, {
        ngo: ngoData,
        accessToken,
        refreshToken
      }, "NGO logged in successfully")
    );
});

/**
 * Logout NGO
 */
const logoutNGO = asyncHandler(async (req, res) => {
  // Clear refresh token in database
  await NGO.findByIdAndUpdate(
    req.ngo._id,
    { $unset: { refreshToken: 1 } }
  );
  
  // Clear cookies
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production"
  };
  
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "NGO logged out successfully"));
});

/**
 * Refresh access token
 */
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;
  
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }
  
  try {
    // Verify the refresh token
    const decodedToken = jwt.verify(
      incomingRefreshToken, 
      process.env.REFRESH_TOKEN_SECRET
    );
    
    // Find NGO by ID
    const ngo = await NGO.findById(decodedToken?._id);
    
    if (!ngo) {
      throw new ApiError(401, "Invalid refresh token");
    }
    
    // Check if the incoming refresh token matches the stored one
    if (incomingRefreshToken !== ngo?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }
    
    // Generate new tokens
    const { accessToken, refreshToken } = await generateTokens(ngo._id);
    
    // Set cookies
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production"
    };
    
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200, 
          { accessToken, refreshToken }, 
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

/**
 * Get NGO profile
 */
const getNGOProfile = asyncHandler(async (req, res) => {
  const ngo = await NGO.findById(req.ngo._id)
    .select("-password -refreshToken -verificationOTP");
  
  if (!ngo) {
    throw new ApiError(404, "NGO not found");
  }
  
  return res.status(200).json(
    new ApiResponse(200, ngo, "NGO profile fetched successfully")
  );
});

/**
 * Update NGO profile
 */
const updateNGOProfile = asyncHandler(async (req, res) => {
  const {
    name,
    contactPerson,
    address,
    affiliation,
    regNumber,
    facilities
  } = req.body;
  
  // // Upload logo if provided
  // let logoUrl;
  // if (req.files && req.files.logo) {
  //   const logoFile = await uploadOnCloudinary(req.files.logo[0].path);
  //   if (logoFile) {
  //     logoUrl = logoFile.url;
  //   }
  // }
  
  // Update fields
  const updateFields = {};
  if (name) updateFields.name = name;
  if (contactPerson) updateFields.contactPerson = contactPerson;
  if (address && typeof address === 'object') {
    updateFields.address = {
      ...ngo.address, // Retain existing address fields
      ...address     // Overwrite with new fields from the request
    };
  }
  if (affiliation) updateFields.affiliation = affiliation;
  if (regNumber) updateFields.regNumber = regNumber;
  if (facilities) updateFields.facilities = facilities;
  // if (logoUrl) updateFields.logo = logoUrl;
  
  // Find and update NGO
  const ngo = await NGO.findByIdAndUpdate(
    req.ngo._id,
    { $set: updateFields },
    { new: true }
  ).select("-password -refreshToken -verificationOTP");
  
  if (!ngo) {
    throw new ApiError(404, "NGO not found");
  }
  
  return res.status(200).json(
    new ApiResponse(200, ngo, "NGO profile updated successfully")
  );
});

/**
 * Update blood inventory
 */
const updateBloodInventory = asyncHandler(async (req, res) => {
  const { bloodGroup, units, operation } = req.body;
  
  if (!bloodGroup || typeof units !== 'number') {
    throw new ApiError(400, "Blood group and units are required");
  }
  
  // Validate blood group
  const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  if (!validBloodGroups.includes(bloodGroup)) {
    throw new ApiError(400, "Invalid blood group");
  }
  
  // Get NGO
  const ngo = await NGO.findById(req.ngo._id);
  
  if (!ngo) {
    throw new ApiError(404, "NGO not found");
  }
  
  // Update blood inventory
  await ngo.updateBloodStock(bloodGroup, units, operation || 'add');
  
  return res.status(200).json(
    new ApiResponse(200, ngo.bloodInventory, "Blood inventory updated successfully")
  );
});

/**
 * Get connected hospitals
 */
const getConnectedHospitals = asyncHandler(async (req, res) => {
  const { status } = req.query;
  
  const ngo = await NGO.findById(req.ngo._id)
    .populate({
      path: 'connectedHospitals.hospitalId',
      select: 'name contactPerson address',
      model: 'Hospital'
    });
  
  if (!ngo) {
    throw new ApiError(404, "NGO not found");
  }
  
  // Filter by status if provided
  let hospitals = ngo.connectedHospitals;
  if (status) {
    hospitals = hospitals.filter(connection => connection.status === status);
  }
  
  return res.status(200).json(
    new ApiResponse(200, hospitals, "Connected hospitals fetched successfully")
  );
});


const respondToConnectionRequest = asyncHandler(async (req, res) => {
  const { hospitalId, status } = req.body;
  
  if (!hospitalId || !status) {
    throw new ApiError(400, "Hospital ID and status are required");
  }
  
  // Validate status
  if (!['Approved', 'Rejected'].includes(status)) {
    throw new ApiError(400, "Status must be either 'Approved' or 'Rejected'");
  }
  
  // Get NGO
  const ngo = await NGO.findById(req.ngo._id);
  
  if (!ngo) {
    throw new ApiError(404, "NGO not found");
  }
  
  // Find connection request
  const connectionIndex = ngo.connectedHospitals.findIndex(
    conn => conn.hospitalId.toString() === hospitalId && conn.status === 'Pending'
  );
  
  if (connectionIndex === -1) {
    throw new ApiError(404, "Pending connection request not found");
  }
  
  // Update connection status
  ngo.connectedHospitals[connectionIndex].status = status;
  await ngo.save();
  
  // Update hospital's connection status as well
  const Hospital = mongoose.model('Hospital');
  await Hospital.updateOne(
    { 
      _id: hospitalId,
      'connectedNGOs.ngoId': req.ngo._id,
      'connectedNGOs.status': 'Pending'
    },
    {
      $set: { 'connectedNGOs.$.status': status }
    }
  );
  
  return res.status(200).json(
    new ApiResponse(200, ngo.connectedHospitals[connectionIndex], "Connection request updated successfully")
  );
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "Current password and new password are required");
  }
  
  // Validate password length
  if (newPassword.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters long");
  }
  
  // Get NGO
  const ngo = await NGO.findById(req.ngo._id);
  
  if (!ngo) {
    throw new ApiError(404, "NGO not found");
  }
  
  // Verify current password
  const isPasswordValid = await ngo.verifyPassword(currentPassword);
  
  if (!isPasswordValid) {
    throw new ApiError(401, "Current password is incorrect");
  }
  
  // Update password
  ngo.password = newPassword;
  await ngo.save();
  
  return res.status(200).json(
    new ApiResponse(200, {}, "Password changed successfully")
  );
});

export {
  registerNGO,
  verifyNGOEmail,
  resendVerificationOtp,
  loginNGO,
  logoutNGO,
  refreshAccessToken,
  getNGOProfile,
  updateNGOProfile,
  updateBloodInventory,
  getConnectedHospitals,
  respondToConnectionRequest,
  changePassword
};