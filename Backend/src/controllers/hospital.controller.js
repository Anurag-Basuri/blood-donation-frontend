import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Hospital from "../models/hospital.models.js";
import NGO from "../models/ngo.models.js";
import jwt from "jsonwebtoken";
import BloodRequest from "../models/bloodrequest.models.js";

/**
 * Generate access and refresh tokens for hospital
 */
const generateTokens = async (hospitalId) => {
  try {
    const hospital = await Hospital.findById(hospitalId);
    
    // Generate access token
    const accessToken = jwt.sign(
      {
        _id: hospital._id,
        name: hospital.name,
        email: hospital.email
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
    
    // Generate refresh token
    const refreshToken = jwt.sign(
      { _id: hospital._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
    
    // Save refresh token to hospital document
    hospital.refreshToken = refreshToken;
    await hospital.save({ validateBeforeSave: false });
    
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Error generating tokens");
  }
};

/**
 * Register a new hospital with complete details
 */
const registerHospital = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    contactPerson,
    emergencyContact,
    address,
    specialties,
    registrationNumber
  } = req.body;
  
  // Validate required fields
  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email and password are required");
  }
  
  // Check if hospital already exists
  const existingHospital = await Hospital.findOne({ email });
  if (existingHospital) {
    throw new ApiError(409, "Hospital with this email already exists");
  }
  
  // Create new hospital
  const hospital = await Hospital.create({
    name,
    email,
    password, // Will be hashed by mongoose-bcrypt plugin
    contactPerson,
    emergencyContact,
    address,
    specialties,
    registrationNumber,
    isVerified: false // Will be verified later
  });
  
  // Generate OTP for verification
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date();
  otpExpiry.setHours(otpExpiry.getHours() + 1); // OTP valid for 1 hour
  
  hospital.verificationOTP = {
    code: otp,
    expiresAt: otpExpiry
  };
  
  await hospital.save();
  
  // TODO: Send verification email with OTP
  // sendVerificationEmail(hospital.email, otp);
  
  // Return success response without sensitive information
  const hospitalData = await Hospital.findById(hospital._id).select("-password -refreshToken -verificationOTP");
  
  return res.status(201).json(
    new ApiResponse(201, hospitalData, "Hospital registered successfully. Please verify your email.")
  );
});

/**
 * Verify hospital email with OTP
 */
const verifyHospitalEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  
  if (!email || !otp) {
    throw new ApiError(400, "Email and OTP are required");
  }
  
  const hospital = await Hospital.findOne({ email });
  
  if (!hospital) {
    throw new ApiError(404, "Hospital not found");
  }
  
  if (hospital.isVerified) {
    return res.status(200).json(
      new ApiResponse(200, {}, "Hospital is already verified")
    );
  }
  
  // Check if OTP is valid and not expired
  if (!hospital.verificationOTP || 
      hospital.verificationOTP.code !== otp || 
      new Date() > new Date(hospital.verificationOTP.expiresAt)) {
    throw new ApiError(400, "Invalid or expired OTP");
  }
  
  // Mark hospital as verified
  hospital.isVerified = true;
  hospital.verificationOTP = undefined; // Clear OTP after verification
  await hospital.save();
  
  return res.status(200).json(
    new ApiResponse(200, {}, "Hospital verified successfully")
  );
});

/**
 * Login hospital
 */
const loginHospital = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }
  
  // Find hospital
  const hospital = await Hospital.findOne({ email });
  
  if (!hospital) {
    throw new ApiError(404, "Hospital not found");
  }
  
  // Check if hospital is verified
  if (!hospital.isVerified) {
    throw new ApiError(401, "Please verify your email first");
  }
  
  // Verify password - mongoose-bcrypt plugin adds this method
  const isPasswordValid = await hospital.verifyPassword(password);
  
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }
  
  // Generate tokens
  const { accessToken, refreshToken } = await generateTokens(hospital._id);
  
  // Get hospital data without sensitive information
  const hospitalData = await Hospital.findById(hospital._id)
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
        hospital: hospitalData,
        accessToken,
        refreshToken
      }, "Hospital logged in successfully")
    );
});

/**
 * Logout hospital
 */
const logoutHospital = asyncHandler(async (req, res) => {
  // Clear refresh token in database
  await Hospital.findByIdAndUpdate(
    req.hospital._id,
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
    .json(new ApiResponse(200, {}, "Hospital logged out successfully"));
});

/**
 * Get hospital profile
 */
const getHospitalProfile = asyncHandler(async (req, res) => {
  const hospital = await Hospital.findById(req.hospital._id)
    .select("-password -refreshToken -verificationOTP");
  
  if (!hospital) {
    throw new ApiError(404, "Hospital not found");
  }
  
  return res.status(200).json(
    new ApiResponse(200, hospital, "Hospital profile fetched successfully")
  );
});

/**
 * Update hospital profile
 */
const updateHospitalProfile = asyncHandler(async (req, res) => {
  const {
    name,
    contactPerson,
    emergencyContact,
    address,
    specialties,
    registrationNumber
  } = req.body;
  
  // Find and update hospital
  const hospital = await Hospital.findByIdAndUpdate(
    req.hospital._id,
    {
      $set: {
        name,
        contactPerson,
        emergencyContact,
        address,
        specialties,
        registrationNumber
      }
    },
    { new: true }
  ).select("-password -refreshToken -verificationOTP");
  
  if (!hospital) {
    throw new ApiError(404, "Hospital not found");
  }
  
  return res.status(200).json(
    new ApiResponse(200, hospital, "Hospital profile updated successfully")
  );
});

/**
 * Update blood requirements
 */
const updateBloodRequirements = asyncHandler(async (req, res) => {
  const { bloodRequirements } = req.body;
  
  if (!bloodRequirements || !Array.isArray(bloodRequirements)) {
    throw new ApiError(400, "Valid blood requirements array is required");
  }
  
  // Validate each blood requirement
  bloodRequirements.forEach(req => {
    if (!req.bloodGroup || !req.unitsNeeded) {
      throw new ApiError(400, "Each blood requirement must have bloodGroup and unitsNeeded");
    }
  });
  
  const hospital = await Hospital.findByIdAndUpdate(
    req.hospital._id,
    { $set: { bloodRequirements } },
    { new: true }
  ).select("-password -refreshToken -verificationOTP");
  
  if (!hospital) {
    throw new ApiError(404, "Hospital not found");
  }
  
  return res.status(200).json(
    new ApiResponse(200, hospital, "Blood requirements updated successfully")
  );
});

/**
 * Find nearby NGOs for blood requests
 */
const findNearbyNGOs = asyncHandler(async (req, res) => {
  const { distance = 10 } = req.query; // Distance in kilometers
  
  const hospital = await Hospital.findById(req.hospital._id);
  if (!hospital || !hospital.address?.location?.coordinates) {
    throw new ApiError(400, "Hospital location not set properly");
  }
  
  // Find NGOs using geospatial query
  const nearbyNGOs = await NGO.find({
    'address.location': {
      $near: {
        $geometry: hospital.address.location,
        $maxDistance: distance * 1000 // Convert to meters
      }
    },
    isVerified: true
  }).select("name contactPerson address facilities bloodInventory");
  
  // Get blood inventory status for each NGO
  const ngosWithBloodStatus = nearbyNGOs.map(ngo => {
    const ngoData = ngo.toObject();
    // Check if NGO has blood groups that hospital requires
    const availableBloodTypes = {};
    
    hospital.bloodRequirements.forEach(req => {
      const ngoBlood = ngo.bloodInventory.find(b => b.bloodGroup === req.bloodGroup);
      availableBloodTypes[req.bloodGroup] = ngoBlood ? ngoBlood.units : 0;
    });
    
    return {
      ...ngoData,
      availableBloodTypes,
      distance: calculateDistance(
        hospital.address.location.coordinates,
        ngo.address.location.coordinates
      )
    };
  });
  
  // Sort by distance
  ngosWithBloodStatus.sort((a, b) => a.distance - b.distance);
  
  return res.status(200).json(
    new ApiResponse(200, ngosWithBloodStatus, "Nearby NGOs fetched successfully")
  );
});

/**
 * Get hospital's blood request history
 */
const getBloodRequestHistory = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;
  
  // Build query
  const query = { hospitalId: req.hospital._id };
  if (status) query.status = status;
  
  // Get requests with pagination
  const requests = await BloodRequest.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('ngoId', 'name contactPerson.name contactPerson.phone');
  
  // Get total count
  const totalRequests = await BloodRequest.countDocuments(query);
  
  // Get request stats
  const stats = {
    total: totalRequests,
    pending: await BloodRequest.countDocuments({ hospitalId: req.hospital._id, status: 'Pending' }),
    accepted: await BloodRequest.countDocuments({ hospitalId: req.hospital._id, status: 'Accepted' }),
    completed: await BloodRequest.countDocuments({ hospitalId: req.hospital._id, status: 'Completed' }),
    rejected: await BloodRequest.countDocuments({ hospitalId: req.hospital._id, status: 'Rejected' })
  };
  
  return res.status(200).json(
    new ApiResponse(200, {
      requests,
      pagination: {
        totalRequests,
        totalPages: Math.ceil(totalRequests / limit),
        currentPage: parseInt(page),
        hasNextPage: page * limit < totalRequests,
        hasPrevPage: page > 1
      },
      stats
    }, "Blood request history fetched successfully")
  );
});

/**
 * Connect with an NGO
 */
const connectWithNGO = asyncHandler(async (req, res) => {
  const { ngoId } = req.body;
  
  if (!ngoId) {
    throw new ApiError(400, "NGO ID is required");
  }
  
  // Check if NGO exists
  const ngo = await NGO.findById(ngoId);
  if (!ngo) {
    throw new ApiError(404, "NGO not found");
  }
  
  // Check if already connected
  const hospital = await Hospital.findById(req.hospital._id);
  const existingConnection = hospital.connectedNGOs.find(
    conn => conn.ngoId.toString() === ngoId
  );
  
  if (existingConnection) {
    throw new ApiError(400, `Already ${existingConnection.status.toLowerCase()} with this NGO`);
  }
  
  // Add connection request
  hospital.connectedNGOs.push({
    ngoId,
    status: 'Pending',
    connectedDate: new Date()
  });
  
  await hospital.save();
  
  // Add connection to NGO as well
  ngo.connectedHospitals.push({
    hospitalId: req.hospital._id,
    status: 'Pending',
    connectedDate: new Date()
  });
  
  await ngo.save();
  
  return res.status(200).json(
    new ApiResponse(200, hospital, "Connection request sent successfully")
  );
});

// Utility function to calculate distance between two coordinates
function calculateDistance(coords1, coords2) {
  // Simple distance calculation - would use a proper geospatial library in production
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(coords2[1] - coords1[1]);
  const dLon = deg2rad(coords2[0] - coords1[0]);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(coords1[1])) * Math.cos(deg2rad(coords2[1])) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

export {
  registerHospital,
  verifyHospitalEmail,
  loginHospital,
  logoutHospital,
  getHospitalProfile,
  updateHospitalProfile,
  updateBloodRequirements,
  findNearbyNGOs,
  getBloodRequestHistory,
  connectWithNGO
};