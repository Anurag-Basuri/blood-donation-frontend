import { BloodRequest } from '../../models/donation/bloodrequest.models.js';
import { Hospital } from '../../models/users/hospital.models.js';
import { User } from '../../models/users/user.models.js';
import { Activity } from '../../models/others/activity.model.js';
import { Notification } from '../../models/others/notification.model.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

// Create Blood Request
const createBloodRequest = asyncHandler(async (req, res) => {
	const {
		bloodGroups,
		urgencyLevel, requiredBy, patientInfo, hospitalId, requestNotes } =
		req.body;

	if (!bloodGroups?.length) {
		throw new ApiError(400, 'Blood group details are required');
	}

	const hospital = await Hospital.findById(hospitalId);
	if (!hospital) throw new ApiError(404, 'Hospital not found');

	const nearbyNGOs = await hospital.findNearbyNGOs(20000); // 20 km radius
	if (!nearbyNGOs.length) throw new ApiError(404, 'No NGOs found in nearby area');

	const requests = await Promise.all(
		nearbyNGOs.map(async ngo => {
			const request = await BloodRequest.create({
				hospitalId,
				ngoId: ngo._id,
				bloodGroups,
				urgencyLevel,
				requiredBy,
				patientInfo,
				requestNotes,
				status: 'Pending',
			});

			await Notification.create({
				type: 'URGENT_BLOOD_REQUEST',
				recipient: ngo._id,
				recipientModel: 'NGO',
				data: {
					requestId: request._id,
					bloodGroups,
					hospital: hospital.name,
					urgencyLevel,
				},
			});

			return request;
		}),
	);

	await Activity.create({
		type: 'BLOOD_REQUEST_CREATED',
		performedBy: {
			userId: req.user._id,
			userModel: req.user.role,
		},
		details: {
			requestIds: requests.map(r => r._id),
			bloodGroups,
			urgencyLevel,
		},
	});

	return res
		.status(201)
		.json(new ApiResponse(201, requests, 'Blood requests created successfully'));
});

// Update Blood Request Status
const updateRequestStatus = asyncHandler(async (req, res) => {
	const { requestId } = req.params;
	const { status, notes } = req.body;

	const request = await BloodRequest.findById(requestId);
	if (!request) throw new ApiError(404, 'Blood request not found');

	await request.updateStatus(status, req.user._id, notes);

	await Notification.create({
		type: 'REQUEST_STATUS_UPDATE',
		recipient: request.hospitalId,
		recipientModel: 'Hospital',
		data: { requestId: request._id, status, notes },
	});

	return res
		.status(200)
		.json(new ApiResponse(200, request, 'Request status updated successfully'));
});

// Find Nearby Eligible Donors
const findDonors = asyncHandler(async (req, res) => {
	const { requestId } = req.params;
	const request = await BloodRequest.findById(requestId);
	if (!request) throw new ApiError(404, 'Blood request not found');

	const bloodGroups = request.bloodGroups.map(bg => bg.bloodGroup);

	const donors = await User.find({
		bloodType: { $in: bloodGroups },
		donorStatus: 'Active',
		'address.location': {
			$near: {
				$geometry: request.deliveryDetails.coordinates,
				$maxDistance: 10000,
			},
		},
	}).select('fullName bloodType lastDonationDate phone email');

	return res.status(200).json(new ApiResponse(200, donors, 'Eligible donors found'));
});

// Get All Emergency Requests
const getEmergencyRequests = asyncHandler(async (req, res) => {
	const requests = await BloodRequest.find({
		urgencyLevel: 'Emergency',
		status: { $nin: ['Completed', 'Cancelled'] },
	}).populate('hospitalId', 'name address');

	return res.status(200).json(new ApiResponse(200, requests, 'Emergency requests fetched'));
});

// Track Blood Request
const trackRequest = asyncHandler(async (req, res) => {
	const { requestId } = req.params;
	const request = await BloodRequest.findById(requestId)
		.populate('hospitalId', 'name address')
		.populate('ngoId', 'name')
		.select('-patientInfo.confidential');

	if (!request) throw new ApiError(404, 'Blood request not found');

	const fulfillment = request.calculateFulfillmentStatus();

	return res
		.status(200)
		.json(new ApiResponse(200, { request, fulfillment }, 'Request details fetched'));
});

// Cancel Blood Request
const cancelRequest = asyncHandler(async (req, res) => {
	const { requestId } = req.params;
	const { reason } = req.body;

	const request = await BloodRequest.findById(requestId);
	if (!request) throw new ApiError(404, 'Blood request not found');

	await request.updateStatus('Cancelled', req.user._id, reason);

	await Promise.all([
		Notification.create({
			type: 'REQUEST_CANCELLED',
			recipient: request.hospitalId,
			recipientModel: 'Hospital',
			data: { requestId, reason },
		}),
		Notification.create({
			type: 'REQUEST_CANCELLED',
			recipient: request.ngoId,
			recipientModel: 'NGO',
			data: { requestId, reason },
		}),
	]);

	return res.status(200).json(new ApiResponse(200, request, 'Request cancelled successfully'));
});

export {
	createBloodRequest,
	updateRequestStatus,
	findDonors,
	getEmergencyRequests,
	trackRequest,
	cancelRequest,
};
