import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import User from "../models/users/user.models.js";
import Hospital from "../models/users/hospital.models.js";
import NGO from "../models/users/ngo.models.js";
import Admin from "../models/users/admin.models.js";

// Constants for common values
const AUTH_HEADER = "Authorization";
const BEARER_PREFIX = "Bearer ";
const TOKEN_FIELDS_TO_EXCLUDE = "-password -refreshToken";
const ENTITY_FIELDS_TO_EXCLUDE = "-password -refreshToken -verificationOTP";

// Helper function to extract token
const extractToken = (req) => {
  const token =
    req.cookies?.accessToken || req.header(AUTH_HEADER)?.replace(BEARER_PREFIX, "");

  if (!token) {
    throw new ApiError(401, "Unauthorized request: No token provided");
  }
  return token;
};

// Helper function to verify JWT
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new ApiError(401, "Token has expired");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new ApiError(401, "Invalid token format");
    }
    throw new ApiError(401, "Token verification failed");
  }
};

// Admin authentication middleware
export const verifyAdmin = asyncHandler(async (req, res, next) => {
  try {
    const token = extractToken(req);
    const decodedToken = verifyToken(token);

    const admin = await Admin.findById(decodedToken?._id)
      .select(TOKEN_FIELDS_TO_EXCLUDE)
      .lean();

    if (!admin || admin.role !== "admin") {
      throw new ApiError(403, "Access denied: Admin authorization required");
    }

    req.admin = admin;
    next();
  } catch (error) {
    next(error);
  }
});

// Entity type mapper for database queries
const ENTITY_TYPE_MAP = {
  admin: { model: Admin, fields: TOKEN_FIELDS_TO_EXCLUDE },
  hospital: { model: Hospital, fields: ENTITY_FIELDS_TO_EXCLUDE },
  ngo: { model: NGO, fields: ENTITY_FIELDS_TO_EXCLUDE },
  user: { model: User, fields: TOKEN_FIELDS_TO_EXCLUDE },
};

// Multi-entity authentication middleware
export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token = extractToken(req);
    const decodedToken = verifyToken(token);

    const entityType = decodedToken?.role || "user";
    const entityConfig = ENTITY_TYPE_MAP[entityType];

    if (!entityConfig) {
      throw new ApiError(400, "Invalid entity type");
    }

    const entity = await entityConfig.model
      .findById(decodedToken?._id)
      .select(entityConfig.fields)
      .lean();

    if (!entity) {
      throw new ApiError(401, `Invalid ${entityType} access token`);
    }

    // Set entity in request object
    req[entityType] = entity;
    req.entityType = entityType;

    next();
  } catch (error) {
    next(error);
  }
});

// Role-based access control middleware
export const requireRoles = (allowedRoles) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.entityType || !allowedRoles.includes(req.entityType)) {
      throw new ApiError(
        403,
        `Access denied: Required roles [${allowedRoles.join(", ")}]`
      );
    }
    next();
  });
};
