import { Equipment } from '../../models/sharing/equipements.models.js';
import { Activity } from '../../models/others/activity.model.js';
import notificationService from '../../services/notification.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

const EQUIPMENT_STATUS = {
	AVAILABLE: 'Available',
	IN_USE: 'In Use',
	MAINTENANCE: 'Under Maintenance',
	RESERVED: 'Reserved',
	DISPOSED: 'Retired',
};

// 📍 List Equipment with filtering and pagination
const listEquipment = asyncHandler(async (req, res) => {
	const {
		type,
		location,
		radius = 10,
		condition,
		sortBy = 'recentlyAdded',
		page = 1,
		limit = 10,
		availability = true,
	} = req.query;

	const query = {
		...(type && { type }),
		...(condition && { 'details.condition': condition }),
		...(availability
			? { 'status.current': EQUIPMENT_STATUS.AVAILABLE }
			: { 'status.current': { $ne: EQUIPMENT_STATUS.DISPOSED } }),
	};

	if (location?.longitude && location?.latitude) {
		query.location = {
			$near: {
				$geometry: {
					type: 'Point',
					coordinates: [parseFloat(location.longitude), parseFloat(location.latitude)],
				},
				$maxDistance: parseFloat(radius) * 1000, // in meters
			},
		};
	}

	const sortOptions = {
		distance: { location: 1 },
		condition: { 'details.condition': -1 },
		recentlyAdded: { createdAt: -1 },
	};

	const equipmentList = await Equipment.find(query)
		.populate('owner.entityId', 'name contactInfo')
		.sort(sortOptions[sortBy] || { createdAt: -1 })
		.skip((page - 1) * limit)
		.limit(parseInt(limit))
		.lean();

	const total = await Equipment.countDocuments(query);

	return res.status(200).json(
		new ApiResponse(200, {
			equipment: equipmentList,
			pagination: {
				currentPage: +page,
				totalPages: Math.ceil(total / limit),
				totalItems: total,
			},
		}, 'Equipment list fetched')
	);
});

// ➕ Add new Equipment
const addEquipment = asyncHandler(async (req, res) => {
	const { name, type, details, location, availability, currentBooking } = req.body;

	if (!name || !type || !details?.condition || !location?.coordinates) {
		throw new ApiError(400, 'Missing required fields');
	}

	const equipment = await Equipment.create({
		name,
		type,
		details,
		location,
		availability,
		currentBooking,
		owner: {
			entityId: req.user._id,
			entityType: req.user.role,
			name: req.user.fullName,
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

	return res
		.status(201)
		.json(
			new ApiResponse(
				201,
				equipment,
				'Equipment added successfully'
			)
		);
});

// 🔁 Update Equipment Status
const updateEquipmentStatus = asyncHandler(async (req, res) => {
	const { equipmentId } = req.params;
	const { status, notes, maintenanceDetails } = req.body;

	const equipment = await Equipment.findById(equipmentId);
	if (!equipment) {
		throw new ApiError(404, 'Equipment not found');
	}

	if (!Object.values(EQUIPMENT_STATUS).includes(status)) {
		throw new ApiError(400, 'Invalid equipment status');
	}

	if (status === EQUIPMENT_STATUS.MAINTENANCE && maintenanceDetails) {
		equipment.maintenanceHistory.push({
			...maintenanceDetails,
			date: new Date(),
		});
	}

	await equipment.updateStatus(status, notes);

	await Activity.create({
		type: 'EQUIPMENT_STATUS_UPDATED',
		performedBy: {
			userId: req.user._id,
			userModel: req.user.role,
		},
		details: {
			equipmentId,
			newStatus: status,
			notes,
		},
	});

	return res
		.status(200)
		.json(
			new ApiResponse(
				200,
				equipment,
				'Equipment status updated'
			)
		);
});

// 📆 Book Equipment
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

	await notificationService.sendNotification('EQUIPMENT_BOOKED', equipment.owner.entityId, {
		equipmentId: equipment._id,
		equipmentName: equipment.name,
		bookedBy: req.user.fullName,
		startDate,
		endDate,
	});

	await Activity.create({
		type: 'EQUIPMENT_BOOKED',
		performedBy: {
			userId: req.user._id,
			userModel: req.user.role,
		},
		details: {
			equipmentId,
			startDate,
			endDate,
			purpose,
		},
	});

	return res
		.status(200)
		.json(
			new ApiResponse(
				200,
				equipment,
				'Equipment booked successfully'
			)
		);
});

// 📚 Get Equipment History
const getEquipmentHistory = asyncHandler(async (req, res) => {
	const { equipmentId } = req.params;

	const equipment = await Equipment.findById(equipmentId);
	if (!equipment) {
		throw new ApiError(404, 'Equipment not found');
	}

	const history = {
		maintenance: equipment.maintenanceHistory || [],
		usage: equipment.usageHistory || [],
		statusHistory: equipment.statusHistory || [],
	};

	return res
		.status(200)
		.json(
			new ApiResponse(
				200,
				history,
				'Equipment history fetched'
			)
		);
});

export {
	listEquipment,
	addEquipment,
	updateEquipmentStatus,
	bookEquipment,
	getEquipmentHistory,
	EQUIPMENT_STATUS,
};
