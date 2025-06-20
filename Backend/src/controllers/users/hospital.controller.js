// NOTE: This controller assumes you already have middleware to attach `req.hospital` where needed
import { Hospital } from '../../models/users/hospital.model.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { uploadFile, deleteFile } from '../../utils/fileUpload.js';
import { generateEmailVerificationToken } from '../utils/generateEmailToken.js';
import { sendMail } from '../utils/sendMail.js';

// Generate access and refresh tokens
const generateTokens = async (hospitalId) => {
	const hospital = await Hospital.findById(hospitalId);
	const accessToken = hospital.generateAccessToken();
	const refreshToken = hospital.generateRefreshToken();

	hospital.refreshToken = refreshToken;
	hospital.lastLogin = new Date();
	await hospital.save({ validateBeforeSave: false });
	return { accessToken, refreshToken };
};

const registerHospital = asyncHandler(async (req, res) => {
	const { name, email, password, address, contactPerson, emergencyContact, specialties } = req.body;

	if (!name || !email || !password || !address || !contactPerson || !emergencyContact) {
		throw new ApiError(400, 'Missing required fields');
	}

	const existingHospital = await Hospital.findOne({ email });
	if (existingHospital) throw new ApiError(409, 'Email already registered');

	const hospital = await Hospital.create({
		name,
		email,
		password,
		address,
		contactPerson,
		emergencyContact,
		specialties,
	});

	return res.status(201).json(new ApiResponse(201, { id: hospital._id }, 'Hospital registered'));
});

const loginHospital = asyncHandler(async (req, res) => {
	const { email, password } = req.body;
	if (!email || !password) throw new ApiError(400, 'Email and password required');

	const hospital = await Hospital.findOne({ email }).select('+password');
	if (!hospital) throw new ApiError(404, 'Hospital not found');

	const isMatch = await hospital.comparePassword(password);
	if (!isMatch) throw new ApiError(401, 'Invalid credentials');

	const tokens = await generateTokens(hospital._id);

	return res.status(200).json(new ApiResponse(200, { hospital, ...tokens }, 'Login successful'));
});

const logoutHospital = asyncHandler(async (req, res) => {
	const hospital = await Hospital.findById(req.hospital._id);
	if (!hospital) throw new ApiError(404, 'Hospital not found');

	hospital.refreshToken = null;
	await hospital.save({ validateBeforeSave: false });
	return res.status(200).json(new ApiResponse(200, {}, 'Logout successful'));
});

const getCurrentHospital = asyncHandler(async (req, res) => {
	const hospital = await Hospital.findById(req.hospital._id).select('-password -refreshToken');
	if (!hospital) throw new ApiError(404, 'Hospital not found');
	return res.status(200).json(new ApiResponse(200, hospital, 'Hospital profile fetched'));
});

const updateHospitalProfile = asyncHandler(async (req, res) => {
	const hospital = await Hospital.findById(req.hospital._id);
	if (!hospital) throw new ApiError(404, 'Hospital not found');

	Object.assign(hospital, req.body);
	await hospital.save();
	return res.status(200).json(new ApiResponse(200, hospital, 'Profile updated'));
});

const uploadLogo = asyncHandler(async (req, res) => {
	const file = req.files?.logo?.[0];
	if (!file) throw new ApiError(400, 'Logo file is required');

	const hospital = await Hospital.findById(req.hospital._id);
	if (!hospital) throw new ApiError(404, 'Hospital not found');

	if (hospital.logo?.publicId) await deleteFile(hospital.logo.publicId);
	const uploaded = await uploadFile({ file, folder: 'hospital-logos' });

	hospital.logo = uploaded;
	await hospital.save();
	return res.status(200).json(new ApiResponse(200, uploaded, 'Logo uploaded successfully'));
});

const sendHospitalVerificationEmail = asyncHandler(async (req, res) => {
	const hospital = await Hospital.findById(req.hospital._id);
	if (!hospital || hospital.isVerified) throw new ApiError(400, 'Already verified');

	const { token, tokenExpiry } = generateEmailVerificationToken();

	hospital.verificationOTP = { code: token, expiresAt: tokenExpiry };
	await hospital.save();

	const verificationURL = `${process.env.CORS_ORIGIN}/verify-hospital-email?token=${token}`;
	const html = `<h2>Verify your hospital email</h2><a href="${verificationURL}">Click to verify</a>`;
	await sendMail({ to: hospital.email, subject: 'Email Verification - BloodConnect 🩸', html });

	return res.status(200).json(new ApiResponse(200, {}, 'Verification email sent'));
});

const verifyHospitalEmail = asyncHandler(async (req, res) => {
	const { token } = req.query;
	const hospital = await Hospital.findOne({
		'verificationOTP.code': token,
		'verificationOTP.expiresAt': { $gt: Date.now() },
	});

	if (!hospital) throw new ApiError(400, 'Invalid or expired token');

	hospital.isVerified = true;
	hospital.verificationOTP = undefined;
	await hospital.save();
	return res.status(200).json(new ApiResponse(200, {}, 'Email verified successfully'));
});

export {
	registerHospital,
	loginHospital,
	logoutHospital,
	getCurrentHospital,
	updateHospitalProfile,
	uploadLogo,
	sendHospitalVerificationEmail,
	verifyHospitalEmail,
};
