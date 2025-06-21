import { PlasmaRequest } from '../../models/donation/plasmarequest.models.js';
import { Hospital } from '../../models/users/hospital.models.js';
import { User } from '../../models/users/user.models.js';
import { Activity } from '../../models/others/activity.model.js';
import { Notification } from '../../models/others/notification.model.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

// Create Plasma Request
const createPlasmaRequest = asyncHandler(async (req, res) => {
	const {
		bloodGroup,
		units,
		urgency,
		requiredBy,
		hospitalId,
		patientInfo,
		covidRecovered,
		antibodyTiter,
	} = req.body;

	if (!bloodGroup || !units || !urgency || !requiredBy || !hospitalId || !patientInfo) {
		throw new ApiError(400, 'Missing required plasma request fields');
	}

	const hospital = await Hospital.findById(hospitalId);
	if (!hospital) {
		throw new ApiError(404, 'Hospital not found');
	}

	const nearbyNGOs = await hospital.findNearbyNGOs(20000);
	if (!nearbyNGOs?.length) {
		throw new ApiError(404, 'No NGOs found nearby');
	}

	const plasmaRequest = await PlasmaRequest.create({
		hospitalId,
		bloodGroup,
		units,
		urgency,
		requiredBy,
		patientInfo,
		covidRecovered,
		antibodyTiter,
		status: 'PENDING',
	});

	await Promise.all(
		nearbyNGOs.map(ngo =>
			Notification.create({
				type: 'URGENT_PLASMA_REQUEST',
				recipient: ngo._id,
				recipientModel: 'NGO',
				data: {
					requestId: plasmaRequest._id,
					bloodGroup,
					hospital: hospital.name,
					urgency,
				},
			}),
		),
	);

	await Activity.create({
		type: 'PLASMA_REQUEST_CREATED',
		performedBy: {
			userId: req.user._id,
			userModel: req.user.role,
		},
		details: {
			requestId: plasmaRequest._id,
			bloodGroup,
			units,
			urgency,
		},
	});

	return res
		.status(201)
		.json(
			new ApiResponse(
				201,
				plasmaRequest,
				'Plasma request created successfully'
			)
		);
});

// Update Status
const updateRequestStatus = asyncHandler(async (req, res) => {
	const { requestId } = req.params;
	const { status, notes } = req.body;

	const request = await PlasmaRequest.findById(requestId);
	if (!request) throw new ApiError(404, 'Plasma request not found');

	await request.updateStatus(status, req.user._id, notes);

	await Notification.create({
		type: 'REQUEST_STATUS_UPDATE',
		recipient: request.hospitalId,
		recipientModel: 'Hospital',
		data: {
			requestId: request._id,
			status,
			notes,
			requestType: 'plasma',
		},
	});

	return res
		.status(200)
		.json(
			new ApiResponse(
				200,
				request,
				'Request status updated successfully'
			)
		);
});

// Find Eligible Donors
const findEligibleDonors = asyncHandler(async (req, res) => {
	const { requestId } = req.params;

	const request = await PlasmaRequest.findById(requestId).populate('hospitalId');
	if (!request) throw new ApiError(404, 'Request not found');

	const donors = await User.find({
		bloodType: request.bloodGroup,
		donorStatus: 'Active',
		covidRecovered: true,
		'address.location': {
			$near: {
				$geometry: request.hospitalId.location,
				$maxDistance: 10000,
			},
		},
		lastDonationDate: {
			$lt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
		},
	}).select('name bloodType phone email lastDonationDate covidRecoveryDate');

	return res
		.status(200)
		.json(
			new ApiResponse(
				200,
				donors,
				'Eligible plasma donors found'
			)
		);
});

// Track Request
const trackRequest = asyncHandler(async (req, res) => {
	const { requestId } = req.params;

	const request = await PlasmaRequest.findById(requestId)
		.populate('hospitalId', 'name address')
		.select('-patientInfo.confidential');

	if (!request) throw new ApiError(404, 'Plasma request not found');

	return res.status(200).json(new ApiResponse(200, request, 'Request details fetched'));
});

// Get Emergency Requests
const getEmergencyRequests = asyncHandler(async (req, res) => {
	const emergencyRequests = await PlasmaRequest.find({
		urgency: 'Critical',
		status: { $nin: ['COMPLETED', 'CANCELLED'] },
	}).populate('hospitalId', 'name address');

	return res
		.status(200)
		.json(
			new ApiResponse(
				200,
				emergencyRequests,
				'Emergency plasma requests fetched'
			)
		);
});

// Cancel Request
const cancelRequest = asyncHandler(async (req, res) => {
	const { requestId } = req.params;
	const { reason } = req.body;

	const request = await PlasmaRequest.findById(requestId);
	if (!request) throw new ApiError(404, 'Plasma request not found');

	await request.updateStatus('CANCELLED', req.user._id, reason);

	await Activity.create({
		type: 'PLASMA_REQUEST_CANCELLED',
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
		.json(
			new ApiResponse(
				200,
				request,
				'Plasma request cancelled successfully'
			)
		);
});

export {
	createPlasmaRequest,
	updateRequestStatus,
	findEligibleDonors,
	trackRequest,
	getEmergencyRequests,
	cancelRequest,
};
