import { Hospital } from '../../models/users/hospital.models.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { uploadFile, deleteFile } from '../../utils/fileUpload.js';
import { generateEmailVerificationToken } from '../../utils/generateEmailToken.js';
import { sendMail } from '../../services/email.service.js';

// Generate access and refresh tokens
const generateTokens = async (hospitalId, role) => {
	const hospital = await Hospital.findById(hospitalId);
	const accessToken = jwt.sign(
		{ _id: hospital._id, role },
		process.env.ACCESS_TOKEN_SECRET,
		{ expiresIn: '1d' }
	);
	const refreshToken = jwt.sign(
		{ _id: hospital._id, role },
		process.env.REFRESH_TOKEN_SECRET,
		{ expiresIn: '7d' }
	);

	hospital.refreshToken = refreshToken;
	hospital.lastLogin = new Date();
	await hospital.save({ validateBeforeSave: false });
	return { accessToken, refreshToken };
};

// Register a new hospital
const registerHospital = asyncHandler(async (req, res) => {
	const {
		name,
		email,
		password,
		address,
		contactPerson,
		emergencyContact,
		specialties,
		registrationNumber
	} = req.body;

	if (!name || !email || !password || !address || !contactPerson || !emergencyContact || !registrationNumber) {
		throw new ApiError(400, 'Missing required fields');
	}

	const existingHospital = await Hospital.findOne({ email });
	if (existingHospital)
		throw new ApiError(409, 'Email already registered');

	const hospital = await Hospital.create({
		name,
		email,
		password,
		address,
		contactPerson,
		emergencyContact,
		specialties,
		registrationNumber
	});

	return res
		.status(201)
		.json(
			new ApiResponse(
				201,
				{ id: hospital._id },
				'Hospital registered'
			)
		);
});

// Login a hospital
const loginHospital = asyncHandler(async (req, res) => {
	const { email, password } = req.body;
	if (!email || !password)
		throw new ApiError(400, 'Email and password required');

	const hospital = await Hospital.findOne({ email }).select('+password');
	if (!hospital) throw new ApiError(404, 'Hospital not found');

	const isMatch = await hospital.comparePassword(password);
	if (!isMatch) throw new ApiError(401, 'Invalid credentials');

	const tokens = await generateTokens(hospital._id, 'hospital');

	return res
		.status(200)
		.json(
			new ApiResponse(
				200,
				{ hospital, ...tokens },
				'Login successful'
			)
		);
});

// Logout a hospital
const logoutHospital = asyncHandler(async (req, res) => {
	const hospital = await Hospital.findById(req.hospital._id);
	if (!hospital) throw new ApiError(404, 'Hospital not found');

	hospital.refreshToken = null;
	await hospital.save({ validateBeforeSave: false });
	return res
		.status(200)
		.json(
			new ApiResponse(200, {}, 'Logout successful')
		);
});

// Change Password
const changePassword = asyncHandler(async (req, res) => {
	const { oldPassword, newPassword } = req.body;
	const hospitalId = req.hospital._id;

	if (!oldPassword || !newPassword) throw new ApiError(400, 'Old and new passwords are required');

	const hospital = await Hospital.findById(hospitalId);
	if (!hospital) throw new ApiError(404, 'Hospital not found');

	const isMatch = await hospital.comparePassword(oldPassword);
	if (!isMatch) throw new ApiError(401, 'Old password is incorrect');

	hospital.password = newPassword;
	await hospital.save();

	return res
		.status(200)
		.json(
			new ApiResponse(
				200, {}, 'Password updated successfully'
			)
		);
});

// Upload documents
const uploadDocument = asyncHandler(async (req, res) => {
	const { documentType } = req.params;
	const hospitalId = req.hospital._id;

	const allowedTypes = [
		'registrationCertificate',
		'tradeLicense',
		'panCard',
		'gstCertificate',
		'fireSafety',
		'bioWaste',
		'drugLicense',
		'bloodBankLicense',
		'radiologyLicense',
		'ambulanceRegistration',
		'accreditation',
		'identityProof',
	];

	if (!allowedTypes.includes(documentType)) {
		throw new ApiError(400, 'Invalid document type');
	}

	const hospital = await Hospital.findById(hospitalId);
	if (!hospital) throw new ApiError(404, 'Hospital not found');

	const currentDoc = hospital.documents?.[documentType];

	// Prevent re-upload unless REJECTED or not uploaded yet
	if (currentDoc?.url && currentDoc.status !== 'REJECTED') {
		throw new ApiError(403, `Cannot re-upload ${documentType}. It is not rejected.`);
	}

	const file = req.files?.document?.[0];
	if (!file) {
		throw new ApiError(400, 'Document file is required');
	}

	// Delete old document from Cloudinary if exists
	if (currentDoc?.publicId) {
		try {
			await deleteFile(currentDoc.publicId);
		} catch (err) {
			console.error('Failed to delete old document:', err.message);
		}
	}

	// Upload new document
	const uploadedDoc = await uploadFile({ file, folder: `hospital-documents` });

	hospital.documents[documentType] = {
		...uploadedDoc,
		uploadedAt: new Date(),
		status: 'PENDING',
	};

	await hospital.save();
	return res
		.status(200)
		.json(
			new ApiResponse(
				200, hospital.documents[documentType],
				`${documentType} uploaded successfully`
			)
		);
});

// Get current hospital profile
const getCurrentHospital = asyncHandler(async (req, res) => {
	const hospital = await Hospital.findById(req.hospital._id).select('-password -refreshToken');
	if (!hospital) throw new ApiError(404, 'Hospital not found');

	return res
		.status(200)
		.json(
			new ApiResponse(
				200,
				hospital,
				'Hospital profile fetched'
			)
		);
});

// Get hospital profile by ID
const getHospitalProfile = asyncHandler(async (req, res) => {
	const { id } = req.params;

	const hospital = await Hospital.findById(id).select(
		'name email logo address contactPerson specialties bloodInventory statistics emergencyContact isVerified adminApproved',
	);

	if (!hospital) {
		throw new ApiError(404, 'Hospital not found');
	}

	return res
		.status(200)
		.json(new ApiResponse(
			200,
			hospital,
			'Hospital profile fetched successfully'
		));
});

// Upload or update profile picture
const uploadProfilePicture = asyncHandler(async (req, res) => {
	const hospitalId = req.hospital._id;
	const hospital = await Hospital.findById(hospitalId);
	if (!hospital) throw new ApiError(404, 'Hospital not found');

	// Check if file is present
	const file = req.files?.profilePicture?.[0];
	if (!file) {
		throw new ApiError(400, 'Profile picture file is required');
	}

	// Delete existing profile picture from Cloudinary if present
	if (hospital.profilePicture && hospital.profilePicture.publicId) {
		try {
			await deleteFromCloudinary(hospital.profilePicture.publicId);
		} catch (err) {
			console.error('Failed to delete old profile picture:', err.message);
		}
	}

	// Upload new profile picture
	const uploadedPicture = await uploadFile({
		file,
		folder: `hospital-profile-pictures`,
	});

	// Update hospital with new profile picture
	hospital.profilePicture = uploadedPicture;

	await hospital.save();

	return res
		.status(200)
		.json(
			new ApiResponse(
				200,
				hospital,
				'Profile picture uploaded successfully'
			)
		);
});

// Update hospital profile
const updateHospitalProfile = asyncHandler(async (req, res) => {
	const hospital = await Hospital.findById(req.hospital._id);
	if (!hospital) throw new ApiError(404, 'Hospital not found');

	Object.assign(hospital, req.body);
	await hospital.save();

	return res
		.status(200)
		.json(
			new ApiResponse(
				200,
				hospital,
				'Profile updated'
			)
		);
});

// Upload hospital logo
const uploadLogo = asyncHandler(async (req, res) => {
	const file = req.files?.logo?.[0];
	if (!file) throw new ApiError(400, 'Logo file is required');

	const hospital = await Hospital.findById(req.hospital._id);
	if (!hospital) throw new ApiError(404, 'Hospital not found');

	if (hospital.logo?.publicId) await deleteFile(hospital.logo.publicId);
	const uploaded = await uploadFile({ file, folder: 'hospital-logos' });

	hospital.logo = uploaded;
	await hospital.save();

	return res
		.status(200)
		.json(
			new ApiResponse(
				200,
				uploaded,
				'Logo uploaded successfully'
			)
		);
});

// Search Hospitals
const searchHospitals = asyncHandler(async (req, res) => {
	const {
		city,
		lat,
		lng,
		bloodGroup,
		radius = 10,
		page = 1,
		limit = 10,
		sortBy = 'relevance',
	} = req.query;

	const query = {};

	// City-based filter
	if (city) {
		query['address.city'] = { $regex: city, $options: 'i' };
	}

	// Blood group filter
	if (bloodGroup) {
		query['bloodInventory'] = {
			$elemMatch: {
				bloodGroup,
				available: { $gt: 0 },
			},
		};
	}

	// Geospatial filter
	if (lat && lng) {
		query['address.location'] = {
			$near: {
				$geometry: {
					type: 'Point',
					coordinates: [parseFloat(lng), parseFloat(lat)],
				},
				$maxDistance: parseFloat(radius) * 1000, // Convert km to meters
			},
		};
	}

	// Sorting options
	const sortOptions = {
		relevance: null,
		units: { 'bloodInventory.available': -1 },
		name: { name: 1 },
	};

	const parsedPage = parseInt(page);
	const parsedLimit = parseInt(limit);
	const skip = (parsedPage - 1) * parsedLimit;

	const hospitals = await Hospital.find(query)
		.select('name logo address bloodInventory contactPerson specialties statistics isVerified')
		.sort(sortOptions[sortBy] || { createdAt: -1 })
		.skip(skip)
		.limit(parsedLimit);

	const total = await Hospital.countDocuments(query);

	return res.status(200).json(
		new ApiResponse(
			200,
			{
				total,
				count: hospitals.length,
				page: parsedPage,
				limit: parsedLimit,
				hospitals,
			},
			'Hospitals matching your search criteria',
		),
	);
});

// Blood Inventory Update
const updateBloodInventory = asyncHandler(async (req, res) => {
	const { bloodGroup, change } = req.body;
	if (!bloodGroup || typeof change !== 'number') {
		throw new ApiError(400, 'Blood group and change amount are required');
	}

	const hospital = await Hospital.findById(req.hospital._id);
	if (!hospital) throw new ApiError(404, 'Hospital not found');

	const updatedHospital = await hospital.updateBloodInventory(bloodGroup, change);
	return res
		.status(200)
		.json(
			new ApiResponse(
				200, updatedHospital.bloodInventory,
				'Blood inventory updated successfully'
			)
		);
});

// Update statistics
const updateStatistics = asyncHandler(async (req, res) => {
	const { bloodGroup, units } = req.body;
	if (!bloodGroup || typeof units !== 'number') {
		throw new ApiError(400, 'Blood group and units are required');
	}

	const hospital = await Hospital.findById(req.hospital._id);
	if (!hospital) throw new ApiError(404, 'Hospital not found');

	const inventoryItem = hospital.bloodInventory.find(i => i.bloodGroup === bloodGroup);
	if (!inventoryItem) {
		throw new ApiError(404, `Blood group ${bloodGroup} not found in inventory`);
	}

	inventoryItem.available += units;
	inventoryItem.lastUpdated = new Date();

	hospital.statistics.totalUnits += units;
	hospital.statistics.lastUpdated = new Date();

	await hospital.save();

	return res
		.status(200)
		.json(
			new ApiResponse(
				200, hospital.statistics,
				'Statistics updated successfully'
			)
		);
});

// Get Hospital Analytics
const getHospitalAnalytics = asyncHandler(async (req, res) => {
	const hospital = await Hospital.findById(req.hospital._id).select('statistics');
	if (!hospital) throw new ApiError(404, 'Hospital not found');

	return res
		.status(200)
		.json(
			new ApiResponse(
				200, hospital.statistics,
				'Hospital analytics fetched successfully'
			)
		);
});

// Update settings for hospital
const updateHospitalSettings = asyncHandler(async (req, res) => {
	const { isPublic, allowBloodRequests } = req.body;
	const hospital = await Hospital.findById(req.hospital._id);
	if (!hospital) throw new ApiError(404, 'Hospital not found');

	hospital.isPublic = isPublic !== undefined ? isPublic : hospital.isPublic;
	hospital.allowBloodRequests = allowBloodRequests !== undefined ? allowBloodRequests : hospital.allowBloodRequests;

	await hospital.save();

	return res
		.status(200)
		.json(
			new ApiResponse(
				200, hospital,
				'Hospital settings updated successfully'
			)
		);
});

// Send hospital verification email
const sendHospitalVerificationEmail = asyncHandler(async (req, res) => {
	const hospital = await Hospital.findById(req.hospital._id);
	if (!hospital || hospital.isVerified) throw new ApiError(400, 'Already verified');

	const { token, tokenExpiry } = generateEmailVerificationToken();

	hospital.verificationOTP = { code: token, expiresAt: tokenExpiry };
	await hospital.save();

	const verificationURL = `${process.env.CORS_ORIGIN}/verify-hospital-email?token=${token}`;
	const html = `<h2>Verify your hospital email</h2><a href="${verificationURL}">Click to verify</a>`;
	await sendMail({ to: hospital.email, subject: 'Email Verification - BloodConnect 🩸', html });

	return res
		.status(200)
		.json(
			new ApiResponse(
				200, {}, 'Verification email sent'
			)
		);
});

// Verify hospital email
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

	return res
		.status(200)
		.json(
			new ApiResponse(
				200, {}, 'Email verified successfully'
			)
		);
});

// Get all hospitals
const getAllHospitals = asyncHandler(async (req, res) => {
	const hospitals = await Hospital.find().select('-password -refreshToken');

	return res
		.status(200)
		.json(
			new ApiResponse(
				200, hospitals, 'Hospitals fetched successfully'
			)
		);
});

export {
	registerHospital,
	loginHospital,
	logoutHospital,
	changePassword,
	uploadDocument,
	getCurrentHospital,
	getHospitalProfile,
	uploadProfilePicture,
	updateHospitalProfile,
	uploadLogo,
	searchHospitals,
	updateBloodInventory,
	updateStatistics,
	getHospitalAnalytics,
	updateHospitalSettings,
	sendHospitalVerificationEmail,
	verifyHospitalEmail,
	getAllHospitals
};
