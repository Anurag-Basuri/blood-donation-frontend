// controllers/admin/admin.controller.js
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

// Permission structure (extendable)
const ADMIN_PERMISSIONS = {
	SUPERADMIN: ['create_admin', 'verify', 'view_analytics'],
	ADMIN: ['verify', 'view_analytics'],
};

// ==================== AUTH CONTROLLER ==================== //
class AdminAuthController {
	static generateTokens = async (admin, req) => {
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

	static register = asyncHandler(async (req, res) => {
		const { fullName, email, password, role = 'ADMIN' } = req.body;

		if (!email?.includes('@') || password?.length < 8) {
			throw new ApiError(400, 'Invalid email or password too short');
		}

		await AdminAuthController.validateRoleCreation(role, req.admin);

		const admin = await Admin.create({
			fullName,
			email,
			password,
			role,
			permissions: ADMIN_PERMISSIONS[role.toUpperCase()],
			createdBy: req.admin?._id,
		});

		await Activity.create({
			type: 'ADMIN_CREATED',
			performedBy: {
				userId: req.admin?._id || admin._id,
				userModel: 'Admin',
			},
			details: {
				adminId: admin._id,
				role,
				permissions: admin.permissions,
				createdAt: new Date(),
			},
		});

		return res.status(201).json(
			new ApiResponse(
				201,
				{
					admin: {
						_id: admin._id,
						fullName: admin.fullName,
						email: admin.email,
						role: admin.role,
						permissions: admin.permissions,
					},
				},
				'Admin registered successfully',
			),
		);
	});

	static login = asyncHandler(async (req, res) => {
		const { email, password } = req.body;
		const admin = await Admin.findOne({ email }).select('+password +loginHistory');

		if (!admin || !(await admin.isPasswordCorrect(password))) {
			await Activity.create({ type: 'FAILED_LOGIN_ATTEMPT', details: { email } });
			throw new ApiError(401, 'Invalid credentials');
		}

		const tokens = await AdminAuthController.generateTokens(admin, req);

		return res
			.status(200)
			.cookie('accessToken', tokens.accessToken, {
				httpOnly: true,
				secure: true,
				sameSite: 'strict',
			})
			.cookie('refreshToken', tokens.refreshToken, {
				httpOnly: true,
				secure: true,
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
							permissions: admin.permissions,
						},
						tokens,
					},
					'Login successful',
				),
			);
	});

	static async validateRoleCreation(role, requester) {
		if (role === 'SUPERADMIN') {
			const exists = await Admin.findOne({ role: 'SUPERADMIN' });
			if (exists) throw new ApiError(403, 'Superadmin already exists');
		}
		if (role === 'ADMIN' && (!requester || requester.role !== 'SUPERADMIN')) {
			throw new ApiError(403, 'Only superadmin can create admins');
		}
	}
}

// ==================== VERIFICATION CONTROLLER ==================== //
class VerificationController {
	static verifyEntity = asyncHandler(async (req, res, entityModel, entityIdKey, entityName) => {
		const { status, remarks, verificationDocuments } = req.body;
		const entityId = req.params[entityIdKey];

		const entity = await entityModel.findById(entityId);
		if (!entity) throw new ApiError(404, `${entityName} not found`);

		entity.isVerified = status === 'approved';
		entity.verificationRemarks = remarks;
		entity.verificationDocuments = verificationDocuments;
		entity.verifiedBy = { adminId: req.admin._id, verifiedAt: new Date() };

		await entity.save();

		await Activity.create({
			type: `${entityName.toUpperCase()}_VERIFICATION`,
			performedBy: { userId: req.admin._id, userModel: 'Admin' },
			details: { id: entityId, status, remarks },
		});

		await Notification.create({
			type: status === 'approved' ? 'VERIFICATION_APPROVED' : 'VERIFICATION_REJECTED',
			recipient: entity._id,
			recipientModel: entityName,
			data: { status, remarks, verifiedBy: req.admin.fullName },
		});

		return res
			.status(200)
			.json(new ApiResponse(200, entity, `${entityName} verification updated`));
	});

	static verifyHospital = (req, res) =>
		VerificationController.verifyEntity(req, res, Hospital, 'hospitalId', 'Hospital');

	static verifyNGO = (req, res) =>
		VerificationController.verifyEntity(req, res, NGO, 'ngoId', 'NGO');
}

// ==================== ANALYTICS CONTROLLER ==================== //
class AnalyticsController {
	static getSystemAnalytics = asyncHandler(async (req, res) => {
		const timeframe = req.query.timeframe || '24h';

		const [hospitals, ngos, analytics, urgentRequests] = await Promise.all([
			Hospital.aggregate([
				{
					$group: {
						_id: '$isVerified',
						count: { $sum: 1 },
						totalRequests: { $sum: '$statistics.totalRequestsMade' },
						emergencyRequests: { $sum: '$statistics.emergencyRequests' },
						capacityUtilization: {
							$avg: {
								$divide: [
									'$statistics.currentPatients',
									{ $max: ['$statistics.totalCapacity', 1] },
								],
							},
						},
					},
				},
			]),
			NGO.aggregate([
				{
					$group: {
						_id: '$isVerified',
						count: { $sum: 1 },
						totalCamps: { $sum: '$statistics.totalCampsOrganized' },
						totalDonations: { $sum: '$statistics.totalDonationsCollected' },
						successRate: {
							$avg: {
								$divide: [
									'$statistics.successfulDonations',
									{ $max: ['$statistics.totalAttempts', 1] },
								],
							},
						},
					},
				},
			]),
			Analytics.findOne().sort({ createdAt: -1 }),
			BloodRequest.countDocuments({
				urgencyLevel: 'Emergency',
				status: { $nin: ['Completed', 'Cancelled'] },
				createdAt: {
					$gte: new Date(Date.now() - AnalyticsController.getTimeframeInMS(timeframe)),
				},
			}),
		]);

		return res.status(200).json(
			new ApiResponse(
				200,
				{
					hospitals,
					ngos,
					analytics,
					urgentRequests,
					systemHealth: await AnalyticsController.getSystemHealth(),
				},
				'System analytics fetched',
			),
		);
	});

	static getTimeframeInMS(timeframe) {
		const ranges = { '24h': 86400000, '7d': 604800000, '30d': 2592000000 };
		return ranges[timeframe] || ranges['24h'];
	}

	static async getSystemHealth() {
		return {
			status: 'Operational',
			checkedAt: new Date(),
			metrics: {
				cpu: process.cpuUsage(),
				memory: process.memoryUsage(),
			},
			services: {
				db: mongoose.connection.readyState === 1 ? 'Healthy' : 'Down',
			},
		};
	}
}

// ==================== EXPORT CONTROLLERS ==================== //
export const registerAdmin = AdminAuthController.register;
export const loginAdmin = AdminAuthController.login;

export const verifyHospital = VerificationController.verifyHospital;
export const verifyNGO = VerificationController.verifyNGO;

export const getSystemAnalytics = AnalyticsController.getSystemAnalytics;
