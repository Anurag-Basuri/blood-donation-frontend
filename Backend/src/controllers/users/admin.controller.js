import mongoose from 'mongoose';
import { Admin } from '../../models/users/admin.models.js';
import { Hospital } from '../../models/users/hospital.models.js';
import { NGO } from '../../models/users/ngo.models.js';
import { Activity } from '../../models/others/activity.model.js';
import { Analytics } from '../../models/others/analytics.model.js';
import { Notification } from '../../models/others/notification.model.js';
import { BloodRequest } from '../../models/donation/bloodrequest.models.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

// ======================= 🔐 AUTHENTICATION =======================

const generateTokens = async (admin, req) => {
	const accessToken = admin.generateAccessToken();
	const refreshToken = admin.generateRefreshToken();

	admin.refreshToken = refreshToken;
	admin.lastLogin = new Date();
	admin.loginHistory.push({
		timestamp: new Date(),
		ipAddress: req.ip,
		userAgent: req.headers['user-agent'],
	});

	await admin.save({ validateBeforeSave: false });
	return { accessToken, refreshToken };
};

const registerAdmin = asyncHandler(async (req, res) => {
	const { fullName, email, password, role = 'admin' } = req.body;

	if (!email?.includes('@') || password?.length < 8) {
		throw new ApiError(400, 'Invalid email or password too short');
	}

	if (role === 'superadmin') {
		const exists = await Admin.findOne({ role: 'superadmin' });
		if (exists) throw new ApiError(403, 'Superadmin already exists');
	}

	const admin = await Admin.create({
		fullName,
		email,
		password,
		role,
		createdBy: req.admin?._id,
	});

	await Activity.create({
		type: 'ADMIN_CREATED',
		performedBy: {
			userId: req.admin?._id || admin._id,
			userModel: 'Admin',
		},
		details: { adminId: admin._id, role },
	});

	res.status(201).json(
		new ApiResponse(
			201,
			{
				admin: {
					_id: admin._id,
					fullName: admin.fullName,
					email: admin.email,
					role: admin.role,
				},
			},
			'Admin registered successfully',
		),
	);
});

const loginAdmin = asyncHandler(async (req, res) => {
	const { email, password } = req.body;

	const admin = await Admin.findOne({ email }).select('+password +loginHistory');
	if (!admin || !(await admin.isPasswordCorrect(password))) {
		await Activity.create({
			type: 'FAILED_LOGIN_ATTEMPT',
			details: { email, timestamp: new Date() },
		});
		throw new ApiError(401, 'Invalid credentials');
	}

	const { accessToken, refreshToken } = await generateTokens(admin, req);

	res.status(200)
		.cookie('accessToken', accessToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
		})
		.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
		})
		.json(
			new ApiResponse(
				200,
				{
					admin: {
						_id: admin._id,
						fullName: admin.fullName,
						role: admin.role,
					},
					tokens: { accessToken, refreshToken },
				},
				'Login successful',
			),
		);
});

// ======================= ✅ VERIFICATION =======================

const verifyEntity = asyncHandler(async (req, res) => {
	const { entity, entityId } = req.params;
	const { status, remarks, verificationDocuments } = req.body;

	const Model = entity === 'hospital' ? Hospital : NGO;
	const entityDoc = await Model.findById(entityId);
	if (!entityDoc) throw new ApiError(404, `${entity} not found`);

	entityDoc.isVerified = status === 'approved';
	entityDoc.verificationRemarks = remarks;
	entityDoc.verificationDocuments = verificationDocuments;
	entityDoc.verifiedBy = {
		adminId: req.admin._id,
		verifiedAt: new Date(),
	};

	await entityDoc.save();

	await Activity.create({
		type: `${entity.toUpperCase()}_VERIFICATION`,
		performedBy: { userId: req.admin._id, userModel: 'Admin' },
		details: { entityId, status, remarks },
	});

	await Notification.create({
		type: status === 'approved' ? 'VERIFICATION_APPROVED' : 'VERIFICATION_REJECTED',
		recipient: entityDoc._id,
		recipientModel: entity === 'hospital' ? 'Hospital' : 'NGO',
		data: {
			status,
			remarks,
			verifiedBy: req.admin.fullName,
		},
	});

	return res
		.status(200)
		.json(new ApiResponse(200, entityDoc, `${entity.toUpperCase()} verification updated`));
});

// ======================= 📊 ANALYTICS =======================

const getSystemAnalytics = asyncHandler(async (req, res) => {
	const timeframe = req.query.timeframe || '24h';
	const duration =
		{
			'24h': 24 * 60 * 60 * 1000,
			'7d': 7 * 24 * 60 * 60 * 1000,
			'30d': 30 * 24 * 60 * 60 * 1000,
		}[timeframe] || 24 * 60 * 60 * 1000;

	const [hospitals, ngos, analytics, urgentRequests] = await Promise.all([
		Hospital.aggregate([{ $group: { _id: '$isVerified', count: { $sum: 1 } } }]),
		NGO.aggregate([{ $group: { _id: '$isVerified', count: { $sum: 1 } } }]),
		Analytics.findOne().sort({ createdAt: -1 }),
		BloodRequest.countDocuments({
			urgencyLevel: 'Emergency',
			status: { $nin: ['Completed', 'Cancelled'] },
			createdAt: { $gte: new Date(Date.now() - duration) },
		}),
	]);

	const systemHealth = {
		status: 'Operational',
		timestamp: new Date(),
		memoryUsage: process.memoryUsage(),
		cpuUsage: process.cpuUsage(),
	};

	res.status(200).json(
		new ApiResponse(
			200,
			{
				hospitals,
				ngos,
				urgentRequests,
				analytics,
				systemHealth,
			},
			'System analytics fetched',
		),
	);
});

// ======================= 🚀 EXPORT =======================

export { registerAdmin, loginAdmin, verifyEntity, getSystemAnalytics };
