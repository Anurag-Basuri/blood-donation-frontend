import { User } from '../../models/users/user.models.js';
import { Activity } from '../../models/others/activity.model.js';
import { DonationAppointment } from '../../models/donation/appointment.models.js';
import { Notification } from '../../models/others/notification.model.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { sendSMS } from '../../services/sms.service.js';
import { generateEmailVerificationToken } from '../utils/generateEmailToken.js';
import { sendMail } from '../utils/sendMail.js';
import jwt from 'jsonwebtoken';

// Constants
const ALLOWED_PROFILE_UPDATES = [
	'userName',
	'fullName',
	'email',
	'phone',
	'dateOfBirth',
	'gender',
	'bloodType',
	'donorStatus',
	'medicalHistory',
	'donationPreferences',
	'address',
];

// AUTH CONTROLLERS
const registerUser = asyncHandler(async (req, res) => {
	const {
		userName,
		fullName,
		email,
		phone,
		dateOfBirth,
		gender,
		bloodType,
		lastDonationDate,
		address,
		password,
	} = req.body;

	const isInvalidDate = date => date && isNaN(new Date(date).getTime());
	const isInvalidEmail = email =>
		email && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/.test(email);
	const isInvalidPhone = phone => phone && !/^\+?[\d\s-]{10,}$/.test(phone);
	const isInvalidBloodType = type =>
		type && !['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].includes(type);

	const validations = [
		{ condition: !userName?.trim(), message: 'Username is required' },
		{ condition: !fullName?.trim(), message: 'Full name is required' },
		{ condition: !email?.trim(), message: 'Email is required' },
		{ condition: !password?.trim(), message: 'Password is required' },
		{ condition: !phone?.trim(), message: 'Phone number is required' },
		{ condition: isInvalidPhone(phone), message: 'Invalid phone number format' },
		{ condition: isInvalidEmail(email), message: 'Invalid email format' },
		{ condition: isInvalidDate(dateOfBirth), message: 'Invalid date of birth' },
		{ condition: isInvalidBloodType(bloodType), message: 'Invalid blood type' },
		{
			condition: isInvalidDate(lastDonationDate),
			message: 'Invalid last donation date',
		},
		{
			condition: address && typeof address !== 'object',
			message: 'Address must be an object with valid fields',
		},
	];

	// Run validations
	for (const { condition, message } of validations) {
		if (condition) {
			return res.status(400).json(new ApiResponse(400, {}, message));
		}
	}

	// Check existing user
	const existingUser = await User.findOne({
		$or: [{ userName }, { email }, { phone }],
	});

	if (existingUser) {
		throw new ApiError(409, 'User with this username, email, or phone already exists');
	}

	// Create user with enhanced details
	const user = await User.create({
		userName,
		fullName,
		email,
		phone,
		dateOfBirth,
		gender,
		bloodType,
		lastDonationDate,
		address,
		password,
		lastLogin: new Date(),
	});

	// Log activity with detailed tracking
	await Activity.create({
		type: 'USER_REGISTERED',
		performedBy: {
			userId: user._id,
			userModel: 'User',
		},
		details: {
			email: user.email,
			registrationIP: req.ip,
			deviceInfo: req.headers['user-agent'],
			timestamp: new Date(),
		},
	});

	// Send welcome notification
	await Notification.create({
		type: 'WELCOME',
		recipient: user._id,
		recipientModel: 'User',
		data: {
			name: user.fullName,
			nextSteps: [
				'Complete your profile',
				'Schedule your first donation',
				'Join our community',
			],
		},
	});

	return res.status(201).json(
		new ApiResponse(
			201,
			{
				user: {
					_id: user._id,
					fullName: user.fullName,
					email: user.email,
					donorStatus: user.donorStatus,
				},
			},
			'Registration successful. Please verify your email.',
		),
	);
});

// Generate Tokens Helper
const generateTokens = async userId => {
	try {
		const user = await User.findById(userId);
		const accessToken = user.generateAccessToken();
		const refreshToken = user.generateRefreshToken();

		user.refreshToken = refreshToken;
		user.lastLogin = new Date();
		await user.save({ validateBeforeSave: false });

		return { accessToken, refreshToken };
	} catch (error) {
		throw new ApiError(500, 'Token generation failed');
	}
};

// Login Controller
const loginUser = asyncHandler(async (req, res) => {
	const { userName, email, phone, password } = req.body;

	if (!password) {
		throw new ApiError(400, 'Password is required');
	}

	// Validate login credentials
	if (!userName && !email && !phone) {
		throw new ApiError(400, 'Username, email, or phone is required');
	}

	// Find user by username, email, or phone
	const user = await User.findOne({
		$or: [{ userName: userName?.trim() }, { email: email?.trim() }, { phone: phone?.trim() }],
	}).select('+password +refreshToken');

	if (!user || !(await user.isPasswordCorrect(password))) {
		throw new ApiError(401, 'Invalid credentials');
	}

	const { accessToken, refreshToken } = await generateTokens(user._id);

	// Update last login time
	user.lastLogin = new Date();
	await user.save({ validateBeforeSave: false });

	// Log activity
	await Activity.create({
		type: 'USER_LOGIN',
		performedBy: {
			userId: user._id,
			userModel: 'User',
		},
	});

	return res
		.status(200)
		.cookie('accessToken', accessToken, { httpOnly: true })
		.cookie('refreshToken', refreshToken, { httpOnly: true })
		.json(
			new ApiResponse(
				200,
				{ user, tokens: { accessToken, refreshToken } },
				'Login successful',
			),
		);
});

// Logout Controller
const logoutUser = asyncHandler(async (req, res) => {
	await User.findByIdAndUpdate(req.user._id, {
		refreshToken: null,
	});

	return res
		.status(200)
		.clearCookie('accessToken')
		.clearCookie('refreshToken')
		.json(new ApiResponse(200, {}, 'Logged out successfully'));
});

// Refresh Token Controller
const refreshAccessToken = asyncHandler(async (req, res) => {
	const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;

	if (!incomingRefreshToken) {
		throw new ApiError(401, 'Refresh token required');
	}

	const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

	const user = await User.findById(decodedToken?._id);
	if (!user || incomingRefreshToken !== user?.refreshToken) {
		throw new ApiError(401, 'Invalid refresh token');
	}

	const { accessToken, refreshToken } = await generateTokens(user._id);

	return res
		.status(200)
		.cookie('accessToken', accessToken, { httpOnly: true })
		.cookie('refreshToken', refreshToken, { httpOnly: true })
		.json(
			new ApiResponse(
				200,
				{ tokens: { accessToken, refreshToken } },
				'Access token refreshed',
			),
		);
});

// PROFILE MANAGEMENT
const updateProfile = asyncHandler(async (req, res) => {
	const updates = Object.keys(req.body)
		.filter(key => ALLOWED_PROFILE_UPDATES.includes(key))
		.reduce((obj, key) => {
			obj[key] = req.body[key];
			return obj;
		}, {});

	const user = await User.findByIdAndUpdate(
		req.user._id,
		{ $set: updates },
		{ new: true, runValidators: true },
	);

	return res.status(200).json(new ApiResponse(200, user, 'Profile updated successfully'));
});

// Change Password
const changePassword = asyncHandler(async (req, res) => {
	const { oldPassword, newPassword } = req.body;

	const user = await User.findById(req.user._id).select('+password');

	if (!(await user.isPasswordCorrect(oldPassword))) {
		throw new ApiError(400, 'Invalid old password');
	}

	user.password = newPassword;
	await user.save();

	await Activity.create({
		type: 'PASSWORD_CHANGED',
		performedBy: {
			userId: user._id,
			userModel: 'User',
		},
	});

	return res.status(200).json(new ApiResponse(200, {}, 'Password changed successfully'));
});

// HISTORY & TRACKING
const getDonationHistory = asyncHandler(async (req, res) => {
	const userId = req.user._id || req.params.id;
	if (!userId) {
		return res.status(400).json(new ApiResponse(400, [], 'User ID is required'));
	}

	const donations = await DonationAppointment.find({
		userId,
		status: 'Completed',
	})
		.sort({ date: -1 })
		.populate('centerId', 'name address');

	return res
		.status(200)
		.json(new ApiResponse(200, donations, 'Donation history fetched successfully'));
});

const getUserActivities = asyncHandler(async (req, res) => {
	const userId = req.user._id || req.params.id;
	if (!userId) {
		return res.status(400).json(new ApiResponse(400, [], 'User ID is required'));
	}

	const activities = await Activity.find({ 'performedBy.userId': userId })
		.sort({ createdAt: -1 })
		.populate('performedBy.userId', 'userName fullName');

	if (!activities || activities.length === 0) {
		return res.status(404).json(new ApiResponse(404, [], 'No activities found for this user'));
	}

	// Format activities to include only necessary fields
	const formattedActivities = activities.map(activity => ({
		_id: activity._id,
		type: activity.type,
		performedBy: {
			userId: activity.performedBy.userId._id,
			userName: activity.performedBy.userId.userName,
			fullName: activity.performedBy.userId.fullName,
		},
		details: activity.details,
		createdAt: activity.createdAt,
	}));

	if (formattedActivities.length === 0) {
		return res.status(404).json(new ApiResponse(404, [], 'No activities found for this user'));
	}

	return res
		.status(200)
		.json(new ApiResponse(200, formattedActivities, 'User activities fetched successfully'));
});

// NOTIFICATIONS
const getNotifications = asyncHandler(async (req, res) => {
	const notifications = await Notification.find({
		recipient: req.user._id,
		status: { $ne: 'READ' },
	}).sort({ createdAt: -1 });

	return res
		.status(200)
		.json(new ApiResponse(200, notifications, 'Notifications fetched successfully'));
});

// Mark Notifications as Read
const markNotificationsRead = asyncHandler(async (req, res) => {
	await Notification.markAllAsRead(req.user._id);

	return res.status(200).json(new ApiResponse(200, {}, 'All notifications marked as read'));
});

// Get user profile and details
const getUserProfile = asyncHandler(async (req, res) => {
	const { id } = req.params;

	const user = await User.findById(id)
		.select(
			'-password -refreshToken -emailVerificationOTP -__v -loginAttempts -lastLogin -bloodDonationHistory -isEmailVerified',
		)
		.populate({
			path: 'donationPreferences.preferredCenter',
			select: 'name location contact', // optional if center has extra details
		});

	if (!user) {
		throw new ApiError(404, 'User not found');
	}

	return res.status(200).json(new ApiResponse(200, user, 'User profile fetched successfully'));
});

// Get Current User
export const getCurrentUser = asyncHandler(async (req, res) => {
	const userId = req.user?._id;

	if (!userId) {
		throw new ApiError(401, 'Unauthorized access');
	}

	const user = await User.findById(userId)
		.select('-password -refreshToken -emailVerificationOTP -__v')
		.populate('donationPreferences.preferredCenter', 'name location contact')
		.populate('bloodDonationHistory.center', 'name location')
		.populate('bloodDonationHistory.donationId', 'date units');

	if (!user) {
		throw new ApiError(404, 'User not found');
	}

	res.status(200).json({
		statusCode: 200,
		success: true,
		message: 'Current user fetched successfully',
		data: user,
	});
});

// Delete User Account(Hard Delete)
const deleteUserAccount = asyncHandler(async (req, res) => {
	const userId = req.user._id || req.params.id;

	if (!userId) {
		return res.status(400).json(new ApiResponse(400, {}, 'User ID is required'));
	}

	const user = await User.findByIdAndDelete(userId);
	if (!user) {
		return res.status(404).json(new ApiResponse(404, {}, 'User not found'));
	}
});

// send OTP to verify phone number
const verifyPhoneNumber = asyncHandler(async (req, res) => {
	let phone = req.user?.phone || req.body.phone;

	if (!phone) {
		throw new ApiError(400, 'Phone number is required');
	}

	let user = await User.findOne({ phone });

	if (!user && req.user?.phone && req.body.phone !== req.user.phone) {
		phone = req.body.phone;
		user = await User.findOne({ phone });
	}

	if (!user) {
		throw new ApiError(404, 'User not found with this phone number');
	}
	// Generate 6-digit OTP and expiry (10 mins)
	const otp = Math.floor(100000 + Math.random() * 900000).toString();
	const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

	user.phoneVerificationOTP = otp;
	user.phoneVerificationOTPExpiry = otpExpiry;
	await user.save();

	await sendSMS({
		to: phone,
		body: `Your verification code is ${otp}. It is valid for 10 minutes.`,
	});

	return res
		.status(200)
		.json(
			new ApiResponse(200, {}, `OTP sent to ${phone.slice(-4).padStart(phone.length, '*')}`),
		);
});

// Verify Phone OTP
const verifyPhoneOTP = asyncHandler(async (req, res) => {
	const { phone, otp } = req.body;

	if (!phone || !otp) {
		throw new ApiError(400, 'Phone and OTP are required');
	}

	const user = await User.findOne({ phone });

	if (!user) throw new ApiError(404, 'User not found');

	if (
		!user.phoneVerificationOTP ||
		user.phoneVerificationOTP !== otp ||
		new Date() > user.phoneVerificationOTPExpiry
	) {
		throw new ApiError(400, 'Invalid or expired OTP');
	}

	user.phoneVerified = true;
	user.phoneVerificationOTP = undefined;
	user.phoneVerificationOTPExpiry = undefined;

	await user.save();

	return res
		.status(200)
		.json(new ApiResponse(200, { phoneVerified: true }, 'Phone number verified successfully'));
});

// Send Verification Email
const sendVerificationEmail = asyncHandler(async (req, res) => {
	const user = await User.findById(req.user?._id);

	if (!user) throw new ApiError(404, 'User not found');

	const { token, tokenExpiry } = generateEmailVerificationToken();

	user.emailVerificationOTP = token;
	user.emailVerificationOTPExpiry = tokenExpiry;
	await user.save();

	const verificationURL = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

	const html = `
        <h2>Email Verification</h2>
        <p>Click the button below to verify your email:</p>
        <a href="${verificationURL}" style="padding:10px 20px; background-color:#e63946; color:white; text-decoration:none;">Verify Email</a>
        <p>This link expires in 15 minutes.</p>
    `;

	await sendMail({
		to: user.email,
		subject: 'Verify your email for BloodConnect 🩸',
		html,
	});

	return res.status(200).json(new ApiResponse(200, {}, 'Verification email sent successfully'));
});

// Verify Email Controller
const verifyEmail = asyncHandler(async (req, res) => {
	const { token } = req.query;

	if (!token) throw new ApiError(400, 'Verification token missing');

	const user = await User.findOne({
		emailVerificationOTP: token,
		emailVerificationOTPExpiry: { $gt: Date.now() },
	});

	if (!user) throw new ApiError(400, 'Invalid or expired token');

	user.isEmailVerified = true;
	user.emailVerificationOTP = undefined;
	user.emailVerificationOTPExpiry = undefined;
	await user.save();

	return res
		.status(200)
		.json(new ApiResponse(200, { emailVerified: true }, 'Email verified successfully'));
});

// Export all controllers
export {
	registerUser,
	loginUser,
	logoutUser,
	refreshAccessToken,
	updateProfile,
	changePassword,
	getDonationHistory,
	getUserActivities,
	getNotifications,
	markNotificationsRead,
	getUserProfile,
	getCurrentUser,
	deleteUserAccount,
	verifyPhoneNumber,
	verifyPhoneOTP,
	sendVerificationEmail,
	verifyEmail,
};
