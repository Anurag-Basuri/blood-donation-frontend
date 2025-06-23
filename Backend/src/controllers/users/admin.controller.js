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