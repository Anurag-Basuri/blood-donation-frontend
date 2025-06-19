import { OrganRequest } from '../../models/donation/organrequest.models.js';
import { Hospital } from '../../models/users/hospital.models.js';
import { NGO } from '../../models/users/ngo.models.js';
import { User } from '../../models/users/user.models.js';
import { Activity } from '../../models/others/activity.model.js';
import { Notification } from '../../models/others/notification.model.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

// Create Organ Request
const createOrganRequest = asyncHandler(async (req, res) => {
	const { hospitalId, organType, bloodGroup, patientInfo, matchingCriteria, documents } =
		req.body;

	// Validate request
	if (!organType || !bloodGroup || !hospitalId || !patientInfo) {
		throw new ApiError(400, 'Missing required fields');
	}

	const hospital = await Hospital.findById(hospitalId);
	if (!hospital) {
		throw new ApiError(404, 'Hospital not found');
	}

	// Create organ request
	const request = await OrganRequest.create({
		requestId: `OR${Date.now()}`,
		hospitalId,
		organType,
		bloodGroup,
		patientInfo,
		matchingCriteria,
		documents,
		status: 'REGISTERED',
	});

	// Notify relevant NGOs
	const nearbyNGOs = await hospital.findNearbyNGOs(50000); // 50km radius for organs
	await Promise.all(
		nearbyNGOs.map(ngo =>
			Notification.create({
				type: 'URGENT_ORGAN_REQUEST',
				recipient: ngo._id,
				recipientModel: 'NGO',
				data: {
					requestId: request._id,
					organType,
					bloodGroup,
					hospital: hospital.name,
					urgencyScore: patientInfo.urgencyScore,
				},
			}),
		),
	);

	// Log activity
	await Activity.create({
		type: 'ORGAN_REQUEST_CREATED',
		performedBy: {
			userId: req.user._id,
			userModel: req.user.role,
		},
		details: {
			requestId: request._id,
			organType,
			bloodGroup,
			urgencyScore: patientInfo.urgencyScore,
		},
	});

	return res
		.status(201)
		.json(new ApiResponse(201, request, 'Organ request created successfully'));
});

// Update Request Status
const updateRequestStatus = asyncHandler(async (req, res) => {
	const { requestId } = req.params;
	const { status, notes } = req.body;

	const request = await OrganRequest.findById(requestId);
	if (!request) {
		throw new ApiError(404, 'Organ request not found');
	}

	await request.updateStatus(status, req.user._id, notes);

	// Notify relevant parties
	await Notification.create({
		type: 'ORGAN_REQUEST_UPDATE',
		recipient: request.hospitalId,
		recipientModel: 'Hospital',
		data: {
			requestId: request._id,
			status,
			notes,
		},
	});

	return res
		.status(200)
		.json(new ApiResponse(200, request, 'Request status updated successfully'));
});

// Find Potential Donors
const findPotentialDonors = asyncHandler(async (req, res) => {
	const { requestId } = req.params;

	const request = await OrganRequest.findById(requestId);
	if (!request) {
		throw new ApiError(404, 'Request not found');
	}

	// Find potential donors based on criteria
	const potentialDonors = await User.find({
		bloodType: request.bloodGroup,
		'organDonorStatus.isRegistered': true,
		'organDonorStatus.organs': request.organType,
		'address.location': {
			$near: {
				$geometry: request.hospital.location,
				$maxDistance: 100000, // 100km radius for organs
			},
		},
	}).select('name bloodType phone email organDonorStatus');

	return res
		.status(200)
		.json(new ApiResponse(200, potentialDonors, 'Potential organ donors found'));
});

// Track Request Status
const trackRequest = asyncHandler(async (req, res) => {
	const { requestId } = req.params;

	const request = await OrganRequest.findById(requestId)
		.populate('hospitalId', 'name address')
		.select('-patientInfo.confidential');

	if (!request) {
		throw new ApiError(404, 'Organ request not found');
	}

	return res.status(200).json(new ApiResponse(200, request, 'Request details fetched'));
});

// Get High Priority Requests
const getHighPriorityRequests = asyncHandler(async (req, res) => {
	const highPriorityRequests = await OrganRequest.find({
		'patientInfo.urgencyScore': { $gte: 80 },
		status: { $nin: ['COMPLETED', 'CANCELLED'] },
	}).populate('hospitalId', 'name address');

	return res
		.status(200)
		.json(new ApiResponse(200, highPriorityRequests, 'High priority organ requests fetched'));
});

// Cancel Request
const cancelRequest = asyncHandler(async (req, res) => {
	const { requestId } = req.params;
	const { reason } = req.body;

	const request = await OrganRequest.findById(requestId);
	if (!request) {
		throw new ApiError(404, 'Organ request not found');
	}

	await request.updateStatus('CANCELLED', req.user._id, reason);

	// Log activity
	await Activity.create({
		type: 'ORGAN_REQUEST_CANCELLED',
		performedBy: {
			userId: req.user._id,
			userModel: req.user.role,
		},
		details: {
			requestId,
			reason,
		},
	});

	return res
		.status(200)
		.json(new ApiResponse(200, request, 'Organ request cancelled successfully'));
});

export {
	createOrganRequest,
	updateRequestStatus,
	findPotentialDonors,
	trackRequest,
	getHighPriorityRequests,
	cancelRequest,
};
