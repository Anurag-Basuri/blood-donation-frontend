import {
    Equipment,
    EQUIPMENT_STATUS,
} from "../../models/sharing/equipements.models.js";
import { Medicine } from "../../models/sharing/medicine.models.js";
import { ResourceRequest } from "../../models/sharing/request.models.js";
import { Activity } from "../../models/others/activity.model.js";
import { Notification } from "../../models/others/notification.model.js";
import { Hospital } from "../../models/users/hospital.models.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { notificationService } from "../../services/notification.service.js";

// Resource Types and Status
const RESOURCE_TYPE = {
    EQUIPMENT: "EQUIPMENT",
    MEDICINE: "MEDICINE",
};

const REQUEST_STATUS = {
    PENDING: "PENDING",
    APPROVED: "APPROVED",
    REJECTED: "REJECTED",
    CANCELLED: "CANCELLED",
    COMPLETED: "COMPLETED",
};

// List available equipment with enhanced filtering
const listEquipment = asyncHandler(async (req, res) => {
    const {
        type,
        location,
        radius = 10,
        condition,
        sortBy = "distance",
        page = 1,
        limit = 10,
    } = req.query;

    const query = {
        ...(type && { type }),
        ...(condition && { "details.condition": condition }),
        "status.current": EQUIPMENT_STATUS.AVAILABLE,
    };

    if (location) {
        query.location = {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: [location.longitude, location.latitude],
                },
                $maxDistance: radius * 1000, // Convert km to meters
            },
        };
    }

    const sortOptions = {
        distance: { location: 1 },
        condition: { "details.condition": -1 },
        recentlyAdded: { createdAt: -1 },
    };

    const equipment = await Equipment.find(query)
        .populate("owner.entityId", "name contactInfo")
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
            "Equipment list fetched"
        )
    );
});

// Share medicine with enhanced validation
const shareMedicine = asyncHandler(async (req, res) => {
    const {
        name,
        category,
        expiryDate,
        quantity,
        location,
        prescriptionRequired,
        storageRequirements,
        manufacturer,
        composition,
    } = req.body;

    // Enhanced validation
    const validations = [
        { condition: !name?.trim(), message: "Medicine name is required" },
        { condition: !category?.trim(), message: "Category is required" },
        {
            condition: new Date(expiryDate) <= new Date(),
            message: "Invalid expiry date",
        },
        { condition: quantity <= 0, message: "Quantity must be positive" },
    ];

    const failedValidation = validations.find((v) => v.condition);
    if (failedValidation) {
        throw new ApiError(400, failedValidation.message);
    }

    const medicine = await Medicine.create({
        name,
        category,
        expiry: {
            expiryDate,
            manufacturingDate: new Date(),
        },
        quantity: {
            available: quantity,
            unit: "units",
        },
        location,
        prescriptionRequired,
        storageRequirements,
        manufacturer,
        composition,
        donor: {
            entityId: req.user._id,
            entityType: req.user.role,
        },
        verification: {
            status: "PENDING",
            submittedAt: new Date(),
        },
    });

    // Log activity
    await Activity.create({
        type: "MEDICINE_SHARED",
        performedBy: {
            userId: req.user._id,
            userModel: req.user.role,
        },
        details: {
            medicineId: medicine._id,
            name,
            quantity,
        },
    });

    // Notify nearby hospitals if essential medicine
    if (category === "ESSENTIAL") {
        await notifyNearbyHospitals(medicine);
    }

    return res
        .status(201)
        .json(new ApiResponse(201, medicine, "Medicine listed for sharing"));
});

// Request resource with enhanced tracking
const requestResource = asyncHandler(async (req, res) => {
    const {
        resourceId,
        resourceType,
        quantity,
        purpose,
        requiredDuration,
        urgencyLevel = "NORMAL",
    } = req.body;

    if (!Object.values(RESOURCE_TYPE).includes(resourceType)) {
        throw new ApiError(400, "Invalid resource type");
    }

    const ResourceModel =
        resourceType === RESOURCE_TYPE.EQUIPMENT ? Equipment : Medicine;

    const resource = await ResourceModel.findById(resourceId)
        .populate("owner.entityId", "email contactInfo.phone")
        .select("+availability +condition");

    if (!resource) {
        throw new ApiError(404, "Resource not found");
    }

    // Validate availability
    if (
        resourceType === RESOURCE_TYPE.MEDICINE &&
        resource.quantity.available < quantity
    ) {
        throw new ApiError(400, "Requested quantity not available");
    }

    const request = await ResourceRequest.create({
        resourceId,
        resourceType,
        requesterId: req.user._id,
        requesterType: req.user.role,
        quantity,
        purpose,
        requiredDuration,
        urgencyLevel,
        status: REQUEST_STATUS.PENDING,
        requestDetails: {
            submittedAt: new Date(),
            location: req.user.address?.location,
        },
    });

    // Create notification and activity log
    await Promise.all([
        notificationService.sendNotification(
            "RESOURCE_REQUEST",
            resource.owner.entityId,
            {
                requestId: request._id,
                resourceName: resource.name,
                requester: req.user.fullName,
                quantity,
                urgencyLevel,
                sendSMS: urgencyLevel === "URGENT",
            }
        ),
        Activity.create({
            type: "RESOURCE_REQUESTED",
            performedBy: {
                userId: req.user._id,
                userModel: req.user.role,
            },
            details: {
                requestId: request._id,
                resourceId,
                resourceType,
                quantity,
            },
        }),
    ]);

    return res
        .status(201)
        .json(new ApiResponse(201, request, "Resource request submitted"));
});

// Helper function to notify nearby hospitals
const notifyNearbyHospitals = async (medicine) => {
    const nearbyHospitals = await Hospital.find({
        "address.location": {
            $near: {
                $geometry: medicine.location,
                $maxDistance: 50000, // 50km radius
            },
        },
        isVerified: true,
    }).select("_id name");

    const notifications = nearbyHospitals.map((hospital) => ({
        type: "NEW_MEDICINE_AVAILABLE",
        recipient: hospital._id,
        recipientModel: "Hospital",
        data: {
            medicineId: medicine._id,
            name: medicine.name,
            quantity: medicine.quantity.available,
            expiryDate: medicine.expiry.expiryDate,
        },
    }));

    await Notification.insertMany(notifications);
};

export {
    listEquipment,
    shareMedicine,
    requestResource,
    RESOURCE_TYPE,
    REQUEST_STATUS,
};
