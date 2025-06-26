import { NGO } from '../../models/users/ngo.models.js';
import { Activity } from '../../models/others/activity.model.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { uploadFile, deleteFile } from '../../utils/fileUpload.js';
import { generateEmailVerificationToken } from '../utils/generateEmailToken.js';
import { sendMail } from '../utils/sendMail.js';

// Enums and Constants
export const NGO_STATUS = {
	PENDING: 'PENDING',
	ACTIVE: 'ACTIVE',
	SUSPENDED: 'SUSPENDED',
	BLACKLISTED: 'BLACKLISTED',
};

export const FACILITY_OPERATIONS = {
	CREATE: 'create',
	UPDATE: 'update',
	DELETE: 'delete',
	SUSPEND: 'suspend',
	ACTIVATE: 'activate',
	LIST: 'LIST',
};

// Helper: Generate tokens for NGO
const generateTokens = async ngoId => {
	const ngo = await NGO.findById(ngoId);
	const accessToken = ngo.generateAccessToken();
	const refreshToken = ngo.generateRefreshToken();

	ngo.refreshToken = refreshToken;
	ngo.lastLogin = new Date();
	await ngo.save({ validateBeforeSave: false });
	return { accessToken, refreshToken };
};

// Registration
const registerNGO = asyncHandler(async (req, res) => {
	const {
		name,
		email,
		contactPerson,
		address,
		regNumber,
		affiliation,
		establishedYear,
		license,
		password,
	} = req.body;

	// Validation
	if (!name?.trim()) throw new ApiError(400, 'NGO name is required');
	if (!email?.trim()) throw new ApiError(400, 'Email is required');
	if (!password?.trim() || password.length < 8)
		throw new ApiError(400, 'Password must be at least 8 characters');
	if (!contactPerson?.name || !contactPerson?.phone)
		throw new ApiError(400, 'Contact person details are required');
	if (!regNumber?.trim()) throw new ApiError(400, 'Registration number is required');
	if (!address?.city || !address?.state || !address?.pinCode || !address?.coordinates)
		throw new ApiError(400, 'Complete address including coordinates is required');

	// Check for existing NGO
	const existingNGO = await NGO.findOne({ $or: [{ email }, { regNumber }] });
	if (existingNGO) {
		throw new ApiError(
			409,
			existingNGO.email === email
				? 'Email already registered'
				: 'Registration number already exists',
		);
	}

	// Create NGO
	const ngo = await NGO.create({
		name,
		email,
		password,
		contactPerson,
		address: {
			...address,
			location: {
				type: 'Point',
				coordinates: address.coordinates,
			},
		},
		regNumber,
		affiliation,
		establishedYear,
		license,
		lastLogin: new Date(),
	});

	// Log activity
	await Activity.create({
		type: 'NGO_REGISTERED',
		performedBy: { userId: ngo._id, userModel: 'NGO' },
		details: {
			ngoId: ngo._id,
			name: ngo.name,
			registrationIP: req.ip,
			timestamp: new Date(),
		},
	});

	return res.status(201).json(
		new ApiResponse(
			201,
			{
				ngo: {
					_id: ngo._id,
					name: ngo.name,
					email: ngo.email,
					status: ngo.isVerified ? 'Verified' : 'Pending Verification',
				},
			},
			'NGO registration submitted for verification',
		),
	);
});

// Login
const loginNGO = asyncHandler(async (req, res) => {
	const { regNumber, email, password } = req.body;
	if (!regNumber && !email) {
		throw new ApiError(400, 'Email or Registration Number is required');
	}

	if (!password || password.length < 8) {
		throw new ApiError(400, 'Password must be at least 8 characters');
	}

	const ngo = await NGO.findOne({ $or: [{ email }, { regNumber }] });
	if (!ngo) throw new ApiError(404, 'NGO not found');

	const isMatch = await ngo.comparePassword(password);
	if (!isMatch) throw new ApiError(401, 'Invalid credentials');

	const tokens = await generateTokens(ngo._id);

	return res.status(200).json(new ApiResponse(200, { ngo, ...tokens }, 'Login successful'));
});

// Logout
const logoutNGO = asyncHandler(async (req, res) => {
	const ngoId = req.ngo._id;
	const ngo = await NGO.findById(ngoId);
	if (!ngo) throw new ApiError(404, 'NGO not found');

	ngo.refreshToken = null;
	await ngo.save({ validateBeforeSave: false });

	return res.status(200).json(new ApiResponse(200, {}, 'Logout successful'));
});

// Change Password
const changePassword = asyncHandler(async (req, res) => {
	const { oldPassword, newPassword } = req.body;
	const ngoId = req.ngo._id;

	if (!oldPassword || !newPassword) throw new ApiError(400, 'Old and new passwords are required');

	const ngo = await NGO.findById(ngoId);
	if (!ngo) throw new ApiError(404, 'NGO not found');

	const isMatch = await ngo.comparePassword(oldPassword);
	if (!isMatch) throw new ApiError(401, 'Old password is incorrect');

	ngo.password = newPassword;
	await ngo.save();

	return res.status(200).json(new ApiResponse(200, {}, 'Password updated successfully'));
});

// Upload documents
const uploadDocuments = asyncHandler(async (req, res) => {
	const { documentType } = req.params;
	const ngoId = req.ngo._id;

	const allowedTypes = ['aadhaarCard', 'panCard', 'gstCertificate', 'licenseDocument'];
	if (!allowedTypes.includes(documentType)) {
		throw new ApiError(400, 'Invalid document type');
	}

	const ngo = await NGO.findById(ngoId);
	if (!ngo) throw new ApiError(404, 'NGO not found');

	const currentDoc = ngo.documents[documentType];

	// Prevent re-upload unless REJECTED or not uploaded yet
	if (currentDoc?.url && currentDoc.status !== 'REJECTED') {
		throw new ApiError(403, `Cannot re-upload ${documentType}. It is not rejected.`);
	}

	// Proceed with upload (you must already have req.file if using multer)
	const uploaded = await uploadToCloudinary(req.file.path, 'documents');

	// Update document with new info
	ngo.documents[documentType] = {
		url: uploaded.secure_url,
		publicId: uploaded.public_id,
		uploadedAt: new Date(),
		status: 'PENDING', // Reset to pending on re-upload
	};

	await ngo.save();
	return res
		.status(200)
		.json(
			new ApiResponse(
				200,
				ngo.documents[documentType],
				`${documentType} uploaded successfully`,
			),
		);
});

// Upload logo
const uploadLogo = asyncHandler(async (req, res) => {
	const ngoId = req.ngo._id;

	// Fetch current NGO to get existing logo publicId
	const ngo = await NGO.findById(ngoId);
	if (!ngo) throw new ApiError(404, 'NGO not found');

	// Check if file is present
	const file = req.files?.logo?.[0];
	if (!file) {
		throw new ApiError(400, 'Logo file is required');
	}

	// Delete existing logo from Cloudinary if present
	const existingLogo = ngo.logo;
	if (existingLogo && existingLogo.publicId) {
		try {
			await deleteFile(existingLogo.publicId);
		} catch (err) {
			console.error('Failed to delete old logo:', err.message);
		}
	}

	// Upload new logo
	const uploadedLogo = await uploadFile({
		file,
		folder: `ngo-logos`,
	});

	// Update NGO with new logo
	ngo.logo = uploadedLogo;
	await ngo.save();

	return res.status(200).json(new ApiResponse(200, ngo, 'Logo uploaded successfully'));
});

// Update NGO Profile
const updateNGOProfile = asyncHandler(async (req, res) => {
	const ngoId = req.ngo._id;
	const {
		name,
		email,
		contactPerson,
		address,
		regNumber,
		affiliation,
		establishedYear,
		license,
		operatingHours,
		facilities,
	} = req.body;

	// Validation
	if (!name?.trim()) throw new ApiError(400, 'NGO name is required');
	if (!email?.trim()) throw new ApiError(400, 'Email is required');
	if (!contactPerson?.name || !contactPerson?.phone)
		throw new ApiError(400, 'Contact person details are required');
	if (!address?.city || !address?.state || !address?.pinCode || !address?.coordinates)
		throw new ApiError(400, 'Complete address including coordinates is required');
	if (!regNumber?.trim()) throw new ApiError(400, 'Registration number is required');
	if (!affiliation?.trim()) throw new ApiError(400, 'Affiliation is required');
	if (!operatingHours?.trim()) throw new ApiError(400, 'Operating hours are required');
	if (!facilities?.length) throw new ApiError(400, 'At least one facility is required');

	const ngo = await NGO.findById(ngoId);

	if (!ngo) throw new ApiError(404, 'NGO not found');
	if (ngo.status === NGO_STATUS.BLACKLISTED) {
		throw new ApiError(403, 'Blacklisted NGOs cannot update profile');
	}

	// Check for existing NGO with same email or regNumber
	const existingNGO = await NGO.findOne({
		$or: [{ email }, { regNumber }],
		_id: { $ne: ngoId },
	});

	if (existingNGO) {
		throw new ApiError(
			409,
			existingNGO.email === email
				? 'Email already registered'
				: 'Registration number already exists',
		);
	}

	// Update NGO details
	if (name !== undefined && name !== null) ngo.name = name;
	if (email !== undefined && email !== null) ngo.email = email;
	if (contactPerson !== undefined && contactPerson !== null) ngo.contactPerson = contactPerson;
	if (address !== undefined && address !== null) ngo.address = address;
	if (regNumber !== undefined && regNumber !== null) ngo.regNumber = regNumber;
	if (affiliation !== undefined && affiliation !== null) ngo.affiliation = affiliation;
	if (establishedYear !== undefined && establishedYear !== null)
		ngo.establishedYear = establishedYear;
	if (license !== undefined && license !== null) ngo.license = license;
	if (operatingHours !== undefined && operatingHours !== null)
		ngo.operatingHours = operatingHours;
	if (facilities !== undefined && facilities !== null) ngo.facilities = facilities;

	await ngo.save();
	return res.status(200).json(new ApiResponse(200, ngo, 'NGO profile updated successfully'));
});

// Blood Inventory Management
const manageBloodInventory = asyncHandler(async (req, res) => {
	const ngoId = req.ngo._id;
	const { bloodGroup, units, operation } = req.body;

	if (
		!bloodGroup ||
		typeof units !== 'number' ||
		!['add', 'subtract', 'set'].includes(operation)
	) {
		throw new ApiError(
			400,
			'Invalid input. Must include bloodGroup, units (number), and a valid operation.',
		);
	}

	const ngo = await NGO.findById(ngoId);
	if (!ngo) throw new ApiError(404, 'NGO not found');

	await ngo.updateBloodStock(bloodGroup, units, operation);

	return res
		.status(200)
		.json(
			new ApiResponse(
				200,
				ngo.bloodInventory,
				`Blood inventory updated: ${operation} ${units} unit(s) of ${bloodGroup}`,
			),
		);
});

// Statistics
const getStatistics = asyncHandler(async (req, res) => {
	const ngo = await NGO.findById(req.ngo._id).select('statistics');
	if (!ngo) throw new ApiError(404, 'NGO not found');

	return res.status(200).json(new ApiResponse(200, ngo.statistics, 'NGO statistics fetched.'));
});

// Recalculate Statistics
const recalculateStatistics = asyncHandler(async (req, res) => {
	const ngo = await NGO.findById(req.ngo._id);
	if (!ngo) throw new ApiError(404, 'NGO not found');

	await ngo.calculateStatistics();
	return res.status(200).json(new ApiResponse(200, ngo.statistics, 'Statistics recalculated.'));
});

// Settings Management
const getSettings = asyncHandler(async (req, res) => {
	const ngo = await NGO.findById(req.ngo._id).select('settings');
	if (!ngo) throw new ApiError(404, 'NGO not found');

	return res.status(200).json(new ApiResponse(200, ngo.settings, 'Settings retrieved.'));
});

// Update Settings
const updateSettings = asyncHandler(async (req, res) => {
	const { settings } = req.body;
	const ngo = await NGO.findById(req.ngo._id);

	if (!ngo) throw new ApiError(404, 'NGO not found');
	if (typeof settings !== 'object') throw new ApiError(400, 'Invalid settings format');

	ngo.settings = { ...ngo.settings.toObject(), ...settings };
	await ngo.save();

	return res.status(200).json(new ApiResponse(200, ngo.settings, 'Settings updated.'));
});

// get NGO Profile
const getNGOProfile = asyncHandler(async (req, res) => {
	const { id } = req.params;

	const ngo = await NGO.findById(id).select(
		'name email logo address contactPerson facilities bloodInventory statistics connectedHospitals',
	);

	if (!ngo) {
		throw new ApiError(404, 'NGO not found');
	}

	return res.status(200).json(new ApiResponse(200, ngo, 'NGO profile fetched successfully'));
});

// Get current NGO
const getCurrentNGO = asyncHandler(async (req, res) => {
	const ngo = await NGO.findById(req.ngo._id).select('-password -refreshToken');

	if (!ngo) {
		throw new ApiError(404, 'NGO not found');
	}

	return res.status(200).json(new ApiResponse(200, ngo, 'Current NGO fetched successfully'));
});

// Search NGOs
const searchNGOs = asyncHandler(async (req, res) => {
	const {
		city,
		bloodGroup,
		lat,
		lng,
		radius = 10,
		page = 1,
		limit = 10,
		sortBy = 'relevance',
	} = req.query;

	const query = {};

	// City-based search
	if (city) {
		query['address.city'] = { $regex: city, $options: 'i' };
	}

	// Blood group availability
	if (bloodGroup) {
		query['bloodInventory'] = {
			$elemMatch: {
				bloodGroup,
				units: { $gt: 0 },
			},
		};
	}

	// Geo-radius based search
	if (lat && lng) {
		query['address.location'] = {
			$near: {
				$geometry: {
					type: 'Point',
					coordinates: [parseFloat(lng), parseFloat(lat)],
				},
				$maxDistance: parseInt(radius) * 1000, // radius in meters
			},
		};
	}

	// Sorting
	const sortOptions = {
		relevance: null,
		units: { 'bloodInventory.units': -1 },
		name: { name: 1 },
	};

	const ngos = await NGO.find(query)
		.select('name logo address bloodInventory contactPerson facilities')
		.sort(sortOptions[sortBy] || null)
		.skip((parseInt(page) - 1) * parseInt(limit))
		.limit(parseInt(limit));

	const total = await NGO.countDocuments(query);

	return res.status(200).json(
		new ApiResponse(
			200,
			{
				total,
				count: ngos.length,
				page: parseInt(page),
				limit: parseInt(limit),
				ngos,
			},
			'NGOs matching your search criteria',
		),
	);
});

// Analytics & Reports
const getNGOAnalytics = asyncHandler(async (req, res) => {
	const ngoId = req.ngo?._id;

	if (!ngoId) {
		throw new ApiError(401, 'Unauthorized');
	}

	const ngo = await NGO.findById(ngoId).select('statistics bloodInventory connectedHospitals');

	if (!ngo) {
		throw new ApiError(404, 'NGO not found');
	}

	const { statistics, bloodInventory, connectedHospitals } = ngo;

	const totalBloodUnits = bloodInventory.reduce((sum, item) => sum + item.units, 0);

	return res.status(200).json(
		new ApiResponse(
			200,
			{
				stats: {
					totalCamps: statistics.totalCampsOrganized,
					totalDonations: statistics.totalDonationsCollected,
					hospitalsConnected: connectedHospitals.length,
					lastCamp: statistics.lastCampDate,
					totalBloodUnits,
					successRate: statistics.successRate,
					monthlyStats: statistics.monthlyStats,
				},
			},
			'NGO analytics fetched successfully',
		),
	);
});

// Send Verification Email
const sendNGOVerificationEmail = asyncHandler(async (req, res) => {
	const ngoId = req.ngo?._id;

	if (!ngoId) throw new ApiError(401, 'Unauthorized');

	const ngo = await NGO.findById(ngoId);

	if (!ngo) throw new ApiError(404, 'NGO not found');
	if (ngo.isVerified) throw new ApiError(400, 'Email already verified');

	const { token, tokenExpiry } = generateEmailVerificationToken();

	ngo.verificationOTP = {
		code: token,
		expiresAt: tokenExpiry,
	};

	await ngo.save();

	const verificationURL = `${process.env.CORS_ORIGIN}/verify-ngo-email?token=${token}`;

	const html = `
        <div style="font-family: sans-serif; color: #333;">
            <h2>Email Verification</h2>
            <p>Hello ${ngo.name},</p>
            <p>Please click the button below to verify your email for <strong>BloodConnect 🩸</strong>.</p>
            <a href="${verificationURL}" style="display: inline-block; padding: 12px 20px; background-color: #d90429; color: white; border-radius: 5px; text-decoration: none;">Verify Email</a>
            <p style="margin-top: 20px;">This link will expire in 15 minutes.</p>
        </div>
    `;

	await sendMail({
		to: ngo.email,
		subject: 'Verify your email for BloodConnect 🩸',
		html,
	});

	return res.status(200).json(new ApiResponse(200, {}, 'Verification email sent successfully'));
});

// Verify Email Controller
const verifyNGOEmail = asyncHandler(async (req, res) => {
	const { token } = req.query;

	if (!token) throw new ApiError(400, 'Verification token missing');

	const ngo = await NGO.findOne({
		'verificationOTP.code': token,
		'verificationOTP.expiresAt': { $gt: Date.now() },
	});

	if (!ngo) throw new ApiError(400, 'Invalid or expired token');

	ngo.isVerified = true;
	ngo.verificationOTP = undefined;

	await ngo.save();

	return res
		.status(200)
		.json(new ApiResponse(200, { emailVerified: true }, 'Email verified successfully'));
});

// Get All NGOs
const getAllNGOs = asyncHandler(async (req, res) => {
	// Parse pagination params with defaults
	const page = parseInt(req.query.page, 10) || 1;
	const limit = parseInt(req.query.limit, 10) || 10;
	const skip = (page - 1) * limit;

	// Optional: Add filters here if needed (e.g., status, city, etc.)
	const filter = {};

	// Get total count for pagination
	const total = await NGO.countDocuments(filter);

	// Fetch NGOs with pagination
	const ngos = await NGO.find(filter)
		.select('name email logo address contactPerson facilities status isVerified')
		.skip(skip)
		.limit(limit)
		.sort({ createdAt: -1 });

	return res.status(200).json(
		new ApiResponse(
			200,
			{
				total,
				count: ngos.length,
				page,
				limit,
				ngos,
			},
			'NGOs fetched successfully',
		),
	);
});

export {
	registerNGO,
	loginNGO,
	logoutNGO,
	changePassword,
	uploadDocuments,
	uploadLogo,
	updateNGOProfile,
	manageBloodInventory,
	getStatistics,
	recalculateStatistics,
	getSettings,
	updateSettings,
	getCurrentNGO,
	getNGOProfile,
	searchNGOs,
	getNGOAnalytics,
	sendNGOVerificationEmail,
	verifyNGOEmail,
	getAllNGOs
};
