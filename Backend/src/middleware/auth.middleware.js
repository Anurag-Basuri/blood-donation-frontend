import jwt from 'jsonwebtoken';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

import { User } from '../models/users/user.models.js';
import { NGO } from '../models/users/ngo.models.js';
import { Hospital } from '../models/users/hospital.models.js';
import { Admin } from '../models/users/admin.models.js';

const AUTH_HEADER = 'Authorization';
const BEARER_PREFIX = 'Bearer ';
const TOKEN_FIELDS_TO_EXCLUDE = '-password -refreshToken -verificationOTP -__v';

// 1. Token extraction
const extractToken = req => {
	const token = req.cookies?.accessToken || req.header(AUTH_HEADER)?.replace(BEARER_PREFIX, '');

	if (!token) {
		throw new ApiError(401, 'Unauthorized: Token not provided');
	}
	return token;
};

// 2. JWT verification
const verifyToken = token => {
	try {
		return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
	} catch (error) {
		if (error instanceof jwt.TokenExpiredError) {
			throw new ApiError(401, 'Token expired');
		}
		if (error instanceof jwt.JsonWebTokenError) {
			throw new ApiError(401, 'Invalid token');
		}
		throw new ApiError(401, 'Token verification failed');
	}
};

// 3. Model Map based on role
const ENTITY_MODEL_MAP = {
	user: User,
	ngo: NGO,
	hospital: Hospital,
	admin: Admin,
};

// 4. General Auth Middleware for all roles
export const verifyJWT = asyncHandler(async (req, res, next) => {
	const token = extractToken(req);
	const decoded = verifyToken(token);
	const { _id, role } = decoded;

	if (!ENTITY_MODEL_MAP[role]) {
		throw new ApiError(401, `Invalid entity type: ${role}`);
	}

	const entity = await ENTITY_MODEL_MAP[role]
		.findById(_id)
		.select(TOKEN_FIELDS_TO_EXCLUDE)
		.lean();

	if (!entity) {
		throw new ApiError(401, `${role} not found or token invalid`);
	}

	req[role] = entity;
	req.entityType = role;

	next();
});

// 5. Admin-Only Middleware
export const verifyAdmin = asyncHandler(async (req, res, next) => {
	const token = extractToken(req);
	const decoded = verifyToken(token);

	const admin = await Admin.findById(decoded._id).select(TOKEN_FIELDS_TO_EXCLUDE).lean();

	if (!admin || admin.role !== 'admin') {
		throw new ApiError(403, 'Admin access only');
	}

	req.admin = admin;
	req.entityType = 'admin';

	next();
});

// 6. Role-Based Middleware (e.g., requireRoles(['admin', 'hospital']))
export const requireRoles = (allowedRoles = []) => {
	return asyncHandler(async (req, res, next) => {
		if (!req.entityType || !allowedRoles.includes(req.entityType)) {
			throw new ApiError(403, `Access denied. Allowed roles: ${allowedRoles.join(', ')}`);
		}
		next();
	});
};
