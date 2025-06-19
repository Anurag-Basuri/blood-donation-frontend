import { Equipment } from '../../models/sharing/equipements.models.js';
import { Activity } from '../../models/others/activity.model.js';
import notificationService from '../../services/notification.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

const EQUIPMENT_STATUS = {
	AVAILABLE: 'AVAILABLE',
	IN_USE: 'IN_USE',
	MAINTENANCE: 'MAINTENANCE',
	DISPOSED: 'DISPOSED',
	RESERVED: 'RESERVED',
};

const listEquipment = asyncHandler(async (req, res) => {
	const {
		type,
		location,
		radius = 10,
		condition,
		sortBy = 'distance',
		page = 1,
		limit = 10,
		availability = true,
	} = req.query;

	const query = {
		...(type && { type }),
		...(condition && { 'details.condition': condition }),
		'status.current': availability
			? EQUIPMENT_STATUS.AVAILABLE
			: { $ne: EQUIPMENT_STATUS.DISPOSED },
	};

	if (location) {
		query.location = {
			$near: {
				$geometry: {
					type: 'Point',
					coordinates: [location.longitude, location.latitude],
				},
				$maxDistance: radius * 1000, // Convert km to meters
			},
		};
	}

	const sortOptions = {
		distance: { location: 1 },
		condition: { 'details.condition': -1 },
		recentlyAdded: { createdAt: -1 },
	};

	const equipment = await Equipment.find(query)
		.populate('owner.entityId', 'name contactInfo')
		.sort(sortOptions[sortBy])
		.skip((page - 1) * limit)
		.limit(limit)
		.lean();

	const total = await Equipment.countDocuments(query);

	return res.status(200).json(
		new ApiResponse(
			200,
			{
				equipment,
				pagination: {
					currentPage: page,
					totalPages: Math.ceil(total / limit),
					totalItems: total,
				},
			},
			'Equipment list fetched',
		),
	);
});

const addEquipment = asyncHandler(async (req, res) => {
	const { name, type, details, location, maintenance, availability } = req.body;

	// Validate required fields
	if (!name || !type || !details?.condition) {
		throw new ApiError(400, 'Missing required fields');
	}

	const equipment = await Equipment.create({
		name,
		type,
		details,
		location,
		maintenance,
		availability,
		owner: {
			entityId: req.user._id,
			entityType: req.user.role,
		},
		status: {
			current: EQUIPMENT_STATUS.AVAILABLE,
			lastUpdated: new Date(),
		},
	});

	await Activity.create({
		type: 'EQUIPMENT_ADDED',
		performedBy: {
			userId: req.user._id,
			userModel: req.user.role,
		},
		details: {
			equipmentId: equipment._id,
			name,
			type,
		},
	});

	return res.status(201).json(new ApiResponse(201, equipment, 'Equipment added successfully'));
});

const updateEquipmentStatus = asyncHandler(async (req, res) => {
	const { equipmentId } = req.params;
	const { status, notes, maintenanceDetails } = req.body;

	const equipment = await Equipment.findById(equipmentId);
	if (!equipment) {
		throw new ApiError(404, 'Equipment not found');
	}

	if (!Object.values(EQUIPMENT_STATUS).includes(status)) {
		throw new ApiError(400, 'Invalid status');
	}

	// Handle maintenance status
	if (status === EQUIPMENT_STATUS.MAINTENANCE && maintenanceDetails) {
		equipment.maintenance = {
			...equipment.maintenance,
			lastMaintenance: new Date(),
			maintenanceHistory: [
				...equipment.maintenance.maintenanceHistory,
				{
					...maintenanceDetails,
					date: new Date(),
				},
			],
		};
	}

	await equipment.updateStatus(status, notes);

	return res.status(200).json(new ApiResponse(200, equipment, 'Equipment status updated'));
});

const bookEquipment = asyncHandler(async (req, res) => {
	const { equipmentId } = req.params;
	const { startDate, endDate, purpose } = req.body;

	const equipment = await Equipment.findById(equipmentId);
	if (!equipment) {
		throw new ApiError(404, 'Equipment not found');
	}

	if (equipment.status.current !== EQUIPMENT_STATUS.AVAILABLE) {
		throw new ApiError(400, 'Equipment is not available for booking');
	}

	await equipment.createBooking(req.user._id, req.user.role, startDate, endDate, purpose);

	// Notify equipment owner
	await notificationService.sendNotification('EQUIPMENT_BOOKED', equipment.owner.entityId, {
		equipmentId: equipment._id,
		equipmentName: equipment.name,
		bookedBy: req.user.fullName,
		startDate,
		endDate,
	});

	return res.status(200).json(new ApiResponse(200, equipment, 'Equipment booked successfully'));
});

const getEquipmentHistory = asyncHandler(async (req, res) => {
	const { equipmentId } = req.params;

	const equipment = await Equipment.findById(equipmentId)
		.select('+maintenance.maintenanceHistory +availability.usageHistory')
		.populate('availability.usageHistory.userId', 'name');

	if (!equipment) {
		throw new ApiError(404, 'Equipment not found');
	}

	const history = {
		maintenance: equipment.maintenance.maintenanceHistory,
		usage: equipment.availability.usageHistory,
		status: equipment.status.history,
	};

	return res.status(200).json(new ApiResponse(200, history, 'Equipment history fetched'));
});

export {
	listEquipment,
	addEquipment,
	updateEquipmentStatus,
	bookEquipment,
	getEquipmentHistory,
	EQUIPMENT_STATUS,
};
