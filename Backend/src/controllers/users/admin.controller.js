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

	return res
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

	return res
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

	return res
		.status(200)
		.json(
			new ApiResponse(
				'Admin profile retrieved successfully',
				admin
			)
		);
});

// Update admin profile
const updateAdminProfile = asyncHandler(async (req, res) => {
	const { fullName, email } = req.body;

	if (!fullName || !email) {
		throw new ApiError(400, 'Full name and email are required');
	}

	const updatedAdmin = await Admin.findByIdAndUpdate(
		req.admin._id,
		{ fullName, email },
		{ new: true, runValidators: true }
	).select('-password');

	if (!updatedAdmin) {
		throw new ApiError(404, 'Admin not found');
	}

	return res
		.status(200)
		.json(
			new ApiResponse(
				'Admin profile updated successfully',
				updatedAdmin
			)
		);
});

// Change admin password
const changeAdminPassword = asyncHandler(async (req, res) => {
	const { currentPassword, newPassword } = req.body;

	if (!currentPassword || !newPassword) {
		throw new ApiError(400, 'Current password and new password are required');
	}

	const admin = await Admin.findById(req.admin._id).select('+password');
	if (!admin || !(await admin.matchPassword(currentPassword))) {
		throw new ApiError(401, 'Invalid current password');
	}

	admin.password = newPassword;
	await admin.save();

	return res
		.status(200)
		.json(
			new ApiResponse(
				'Admin password changed successfully'
			)
		);
});

// Delete admin account
const deleteAdminAccount = asyncHandler(async (req, res) => {
	const admin = await Admin.findById(req.admin._id);
	if (!admin) {
		throw new ApiError(404, 'Admin not found');
	}

	await admin.remove();

	res
		.status(200)
		.json(
			new ApiResponse(
				'Admin account deleted successfully'
			)
		);
});

/**
 * User
*/
// warn the user
const warnUser = asyncHandler(async (req, res) => {
	const { userId } = req.params;

	if (!mongoose.isValidObjectId(userId)) {
		throw new ApiError(400, 'Invalid user ID');
	}

	// Send warning notification to user (using Notification model's recipient field)
	const notification = new Notification({
		recipient: userId,
		recipientModel: 'User',
		message: 'You have been warned by the admin.',
		type: 'user_warning',
		status: 'unread',
		data: {
			reason: 'Inappropriate behavior',
		},
	});
	await notification.save();

	return res.status(200).json(new ApiResponse(200, null, 'User warned successfully'));
});

// deactivate user account
const deactivateUserAccount = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
		throw new ApiError(400, 'Invalid user ID');
	}

	const user = await User.findById(userId);
	if (!user) {
		throw new ApiError(404, 'User not found');
	}

	user.deactivated = true;
	user.deactivationReason = req.body.reason || 'User Request';
	await user.save();

	// Send notification to user (using Notification model's recipient field)
	const notification = new Notification({
		recipient: user._id,
		recipientModel: 'User',
		message: 'Your account has been deactivated by the admin.',
		type: 'account_deactivation',
		status: 'unread',
		data: {
			reason: user.deactivationReason,
		},
	});
	await notification.save();

    return res.status(200).json(new ApiResponse(200, user, 'User account deactivated successfully'));
});

// reactivate user account
const reactivateUserAccount = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
		throw new ApiError(400, 'Invalid user ID');
	}

	const user = await User.findById(userId);
	if (!user) {
		throw new ApiError(404, 'User not found');
	}

	if (!user.deactivated) {
		throw new ApiError(400, 'User account is not deactivated');
	}

	user.deactivated = false;
	user.deactivationReason = null;
	await user.save();

	// Send notification to user (using Notification model's recipient field)
	const notification = new Notification({
		recipient: user._id,
		recipientModel: 'User',
		message: 'Your account has been reactivated by the admin.',
		type: 'account_reactivation',
		status: 'unread',
		data: {
			reason: 'Your account has been reactivated and is now active.',
		},
	});
	await notification.save();

	return res
		.status(200)
		.json(
			new ApiResponse(
				200,
				user,
				'User account reactivated successfully'
			)
		);
});

/**
 * NGO
 */
// warn the NGO
const warnNGO = asyncHandler(async (req, res) => {
	const { ngoId } = req.params;

	if (!mongoose.isValidObjectId(ngoId)) {
		throw new ApiError(400, 'Invalid NGO ID');
	}

	// Send warning notification to NGO (using Notification model's recipient field)
	const notification = new Notification({
		recipient: ngoId,
		recipientModel: 'NGO',
		message: 'You have been warned by the admin.',
		type: 'ngo_warning',
		status: 'unread',
		data: {
			reason: 'Inappropriate behavior',
		},
	});
	await notification.save();

	return res
		.status(200)
		.json(
			new ApiResponse
				(200, null, 'NGO warned successfully'
			)
		);
});

// deactivate NGO account
const deactivateNGOAccount = asyncHandler(async (req, res) => {
	const { ngoId } = req.params;

	if (!mongoose.isValidObjectId(ngoId)) {
		throw new ApiError(400, 'Invalid NGO ID');
	}

	const ngo = await NGO.findById(ngoId);
	if (!ngo) {
		throw new ApiError(404, 'NGO not found');
	}
	ngo.deactivated = true;
	ngo.deactivationReason = req.body.reason || 'User Request';
	await ngo.save();

	// Send notification to NGO (using Notification model's recipient field)
	const notification = new Notification({
		recipient: ngo._id,
		recipientModel: 'NGO',
		message: 'Your account has been deactivated by the admin.',
		type: 'account_deactivation',
		status: 'unread',
		data: {
			reason: ngo.deactivationReason,
		},
	});
	await notification.save();

	return res
		.status(200)
		.json(
			new ApiResponse(
				200,
				ngo,
				'NGO account deactivated successfully'
			)
		);
});

// reactivate NGO account
const reactivateNGOAccount = asyncHandler(async (req, res) => {
	const { ngoId } = req.params;

	if (!mongoose.isValidObjectId(ngoId)) {
		throw new ApiError(400, 'Invalid NGO ID');
	}

	const ngo = await NGO.findById(ngoId);
	if (!ngo) {
		throw new ApiError(404, 'NGO not found');
	}
	if (!ngo.deactivated) {
		throw new ApiError(400, 'NGO account is not deactivated');
	}
	ngo.deactivated = false;
	ngo.deactivationReason = null;
	await ngo.save();

	// Send notification to NGO (using Notification model's recipient field)
	const notification = new Notification({
		recipient: ngo._id,
		recipientModel: 'NGO',
		message: 'Your account has been reactivated by the admin.',
		type: 'account_reactivation',
		status: 'unread',
		data: {
			reason: 'Your account has been reactivated and is now active.',
		},
	});
	await notification.save();

	return res
		.status(200)
		.json(
			new ApiResponse(
				200,
				ngo,
				'NGO account reactivated successfully'
			)
		);
});

// Verify NGO documents(adminApproved)
const approveNGODocs = asyncHandler(async (req, res) => {
    const { ngoId } = req.params;
    const { action, warningMessage } = req.body; // action: 'approve' or 'warn'

    if (!mongoose.isValidObjectId(ngoId)) {
        throw new ApiError(400, 'Invalid NGO ID');
    }

    const ngo = await NGO.findById(ngoId);
    if (!ngo) {
        throw new ApiError(404, 'NGO not found');
    }

    if (action === 'approve') {
        if (ngo.adminApproved) {
            throw new ApiError(400, 'NGO documents are already approved');
        }
        ngo.adminApproved = true;
        await ngo.save();

        // Send approval notification
        const notification = new Notification({
            recipient: ngo._id,
            recipientModel: 'NGO',
            message: 'Your documents have been approved by the admin.',
            type: 'document_approval',
            status: 'unread',
            data: {
                reason: 'Your documents have been approved and are now active.',
            },
        });
        await notification.save();

        return res.status(200).json(
            new ApiResponse(
                200,
                ngo,
                'NGO documents approved successfully'
            )
        );
    } else if (action === 'warn') {
        if (!warningMessage || warningMessage.trim() === '') {
            throw new ApiError(400, 'Warning message is required');
        }

        // Send warning notification
        const notification = new Notification({
            recipient: ngo._id,
            recipientModel: 'NGO',
            message: warningMessage,
            type: 'document_warning',
            status: 'unread',
            data: {
                reason: warningMessage,
            },
        });
        await notification.save();

        return res.status(200).json(
            new ApiResponse(
                200,
                null,
                'Warning notification sent to NGO'
            )
        );
    } else {
        throw new ApiError(400, "Invalid action. Use 'approve' or 'warn'.");
    }
});

// Get NGO documents
const getNGODocuments = asyncHandler(async (req, res) => {
    const { ngoId } = req.params;

    if (!mongoose.isValidObjectId(ngoId)) {
        throw new ApiError(400, 'Invalid NGO ID');
    }

    const ngo = await NGO.findById(ngoId).select(
        'name email documents adminApproved isVerified status'
    );

    if (!ngo) {
        throw new ApiError(404, 'NGO not found');
    }

    // The 'documents' field should contain URLs/publicIds for each uploaded doc
    return res.status(200).json(
        new ApiResponse(
            200,
            ngo,
            'NGO documents fetched successfully'
        )
    );
});

/*
 * Hospital
*/
// warn the hospital
const warnHospital = asyncHandler(async (req, res) => {
	const { hospitalId } = req.params;

	if (!mongoose.isValidObjectId(hospitalId)) {
		throw new ApiError(400, 'Invalid hospital ID');
	}

	// Send warning notification to hospital (using Notification model's recipient field)
	const notification = new Notification({
		recipient: hospitalId,
		recipientModel: 'Hospital',
		message: 'You have been warned by the admin.',
		type: 'hospital_warning',
		status: 'unread',
		data: {
			reason: 'Inappropriate behavior',
		},
	});
	await notification.save();

	return res
		.status(200)
		.json(
			new ApiResponse(
				200,
				null,
				'Hospital warned successfully'
			)
		);
});