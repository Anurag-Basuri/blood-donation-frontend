import mongoose from 'mongoose';
import { Admin } from '../../models/users/admin.models.js';
import { User } from '../../models/users/user.models.js';
import { NGO } from '../../models/users/ngo.models.js';
import { Hospital } from '../../models/users/hospital.models.js';
import { DonationAppointment } from '../../models/donation/appointment.models.js';
import { BloodRequest } from '../../models/donation/bloodrequest.models.js';
import { OrganRequest } from '../../models/donation/organrequest.models.js';
import { PlasmaRequest } from '../../models/donation/plasmaRequest.models.js';
import { Facility } from '../../models/donation/facility.models.js';
import { Activity } from '../../models/others/activity.model.js';
import { Analytics } from '../../models/others/analytics.model.js';
import { Notification } from '../../models/others/notification.model.js';
import { Equipment } from '../../models/sharing/equipements.models.js';
import { Medicine } from '../../models/sharing/medicine.models.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

// Register a new admin
const registerAdmin = asyncHandler(async (req, res) => {
	const { fullName, email, password, secret } = req.body;

	if (secret !== process.env.ADMIN_SECRET) {
		throw new ApiError(403, 'Invalid admin secret');
	}

	if (!fullName || !email || !password) {
		throw new ApiError(400, 'Full name, email, and password are required');
	}

	const existingAdmin = await Admin.findOne({ email });
	if (existingAdmin) {
		throw new ApiError(400, 'Admin with this email already exists');
	}

	const newAdmin = await Admin.create({ fullName, email, password });

	res
		.status(201)
		.json(
			new ApiResponse(
				'Admin registered successfully', newAdmin
			)
		);
});

// login admin
const loginAdmin = asyncHandler(async (req, res) => {
	const { email, password, secret } = req.body;

	if (!email || !password || secret !== process.env.ADMIN_SECRET) {
		throw new ApiError(400, 'Email, password, and admin secret are required');
	}

	const admin = await Admin.findOne({ email }).select('+password');
	if (!admin || !(await admin.matchPassword(password))) {
		throw new ApiError(401, 'Invalid email or password');
	}

	const token = await admin.generateAuthToken();

	res
		.status(200)
		.json(
			new ApiResponse(
				'Admin logged in successfully',
				{ token, admin }
			)
		);
});

// Get admin dashboard data
const getAdminDashboardData = asyncHandler(async (req, res) => {
	const now = new Date();
	const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
	const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

	const [
		totalUsers,
		newUsersThisMonth,
		totalHospitals,
		verifiedHospitals,
		totalNGOs,
		verifiedNGOs,
		totalDonationAppointments,
		fulfilledAppointments,
		pendingAppointments,
		totalBloodRequests,
		activeBloodRequests,
		totalOrganRequests,
		activeOrganRequests,
		totalPlasmaRequests,
		activePlasmaRequests,
		totalFacilities,
		totalEquipments,
		totalMedicines,
		availableMedicines,
		activityLast7Days,
		totalActivities,
		totalNotifications,
		unreadNotifications,
		totalAnalytics,
		totalAdmins,
	] = await Promise.all([
		User.countDocuments(),
		User.countDocuments({ createdAt: { $gte: monthStart } }),
		Hospital.countDocuments(),
		Hospital.countDocuments({ isVerified: true }),
		NGO.countDocuments(),
		NGO.countDocuments({ isVerified: true }),
		DonationAppointment.countDocuments(),
		DonationAppointment.countDocuments({ status: 'completed' }),
		DonationAppointment.countDocuments({ status: 'pending' }),
		BloodRequest.countDocuments(),
		BloodRequest.countDocuments({ status: { $nin: ['Completed', 'Cancelled'] } }),
		OrganRequest.countDocuments(),
		OrganRequest.countDocuments({ status: { $nin: ['Completed', 'Cancelled'] } }),
		PlasmaRequest.countDocuments(),
		PlasmaRequest.countDocuments({ status: { $nin: ['Completed', 'Cancelled'] } }),
		Facility.countDocuments(),
		Equipment.countDocuments(),
		Medicine.countDocuments(),
		Medicine.countDocuments({ stock: { $gt: 0 } }),
		Activity.countDocuments({ createdAt: { $gte: last7Days } }),
		Activity.countDocuments(),
		Notification.countDocuments(),
		Notification.countDocuments({ status: { $ne: 'read' } }),
		Analytics.countDocuments(),
		Admin.countDocuments(),
	]);

	const dashboardData = {
		users: {
			total: totalUsers,
			newThisMonth: newUsersThisMonth,
		},
		ngos: {
			total: totalNGOs,
			verified: verifiedNGOs,
			unverified: totalNGOs - verifiedNGOs,
		},
		hospitals: {
			total: totalHospitals,
			verified: verifiedHospitals,
			unverified: totalHospitals - verifiedHospitals,
		},
		donations: {
			totalAppointments: totalDonationAppointments,
			fulfilled: fulfilledAppointments,
			pending: pendingAppointments,
		},
		requests: {
			blood: {
				total: totalBloodRequests,
				active: activeBloodRequests,
			},
			organ: {
				total: totalOrganRequests,
				active: activeOrganRequests,
			},
			plasma: {
				total: totalPlasmaRequests,
				active: activePlasmaRequests,
			},
		},
		resources: {
			facilities: totalFacilities,
			equipments: totalEquipments,
			medicines: {
				total: totalMedicines,
				available: availableMedicines,
			},
		},
		activities: {
			total: totalActivities,
			last7Days: activityLast7Days,
		},
		notifications: {
			total: totalNotifications,
			unread: unreadNotifications,
		},
		system: {
			analyticsEntries: totalAnalytics,
			admins: totalAdmins,
		},
	};

	return res
		.status(200)
		.json(
			new ApiResponse(
				200,
				dashboardData,
				'Admin dashboard data retrieved successfully'
			)
		);
});

// Get admin profile
const getAdminProfile = asyncHandler(async (req, res) => {
	const admin = await Admin.findById(req.admin._id).select('-password');
	if (!admin) {
		throw new ApiError(404, 'Admin not found');
	}

	res
		.status(200)
		.json(
			new ApiResponse(
				'Admin profile retrieved successfully',
				admin
			)
		);
});