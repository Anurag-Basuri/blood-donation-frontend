import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import User from "../models/user.models.js";
import Hospital from "../models/hospital.models.js";
import NGO from "../models/ngo.models.js";
import Admin from "../models/admin.models.js";

// Admin authentication middleware
export const verifyAdmin = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const admin = await Admin.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!admin || admin.role !== "admin") {
      throw new ApiError(401, "Access denied: Admin authorization required");
    }

    req.admin = admin;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

// Multi-entity authentication middleware
export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Check entity type and verify accordingly
    switch (decodedToken?.role) {
      case "admin":
        const admin = await Admin.findById(decodedToken?._id).select(
          "-password -refreshToken"
        );
        if (!admin) throw new ApiError(401, "Invalid admin access token");
        req.admin = admin;
        req.entityType = "admin";
        break;

      case "hospital":
        const hospital = await Hospital.findById(decodedToken?._id).select(
          "-password -refreshToken -verificationOTP"
        );
        if (!hospital) throw new ApiError(401, "Invalid hospital access token");
        req.hospital = hospital;
        req.entityType = "hospital";
        break;

      case "ngo":
        const ngo = await NGO.findById(decodedToken?._id).select(
          "-password -refreshToken -verificationOTP"
        );
        if (!ngo) throw new ApiError(401, "Invalid NGO access token");
        req.ngo = ngo;
        req.entityType = "ngo";
        break;

      default: // User
        const user = await User.findById(decodedToken?._id).select(
          "-password -refreshToken"
        );
        if (!user) throw new ApiError(401, "Invalid user access token");
        req.user = user;
        req.entityType = "user";
    }

    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});
