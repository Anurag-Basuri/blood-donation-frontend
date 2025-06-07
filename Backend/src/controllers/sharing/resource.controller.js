import { Equipment } from "../../models/sharing/equipment.models.js";
import { Medicine } from "../../models/sharing/medicine.models.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

// List available equipment
const listEquipment = asyncHandler(async (req, res) => {
    const { type, location, radius = 10 } = req.query;

    const equipment = await Equipment.find({
        type,
        'status.current': 'AVAILABLE',
        location: {
            $near: {
                $geometry: location,
                $maxDistance: radius * 1000
            }
        }
    }).populate('owner.entityId');

    return res.status(200).json(
        new ApiResponse(200, equipment, "Equipment list fetched")
    );
});

// Share medicine
const shareMedicine = asyncHandler(async (req, res) => {
    const {
        name,
        category,
        expiryDate,
        quantity,
        location,
        prescriptionRequired
    } = req.body;

    // Validate expiry date
    if (new Date(expiryDate) <= new Date()) {
        throw new ApiError(400, "Medicine has expired");
    }

    const medicine = await Medicine.create({
        name,
        category,
        expiryDate,
        quantity,
        location,
        prescriptionRequired,
        donor: {
            entityId: req.user._id,
            entityType: req.user.role
        }
    });

    return res.status(201).json(
        new ApiResponse(201, medicine, "Medicine listed for sharing")
    );
});

// Request resource
const requestResource = asyncHandler(async (req, res) => {
    const { resourceId, resourceType, quantity, purpose } = req.body;

    const ResourceModel = resourceType === 'EQUIPMENT' ? Equipment : Medicine;
    
    const resource = await ResourceModel.findById(resourceId);
    if (!resource) {
        throw new ApiError(404, "Resource not found");
    }

    const request = await ResourceRequest.create({
        resourceId,
        resourceType,
        requesterId: req.user._id,
        requesterType: req.user.role,
        quantity,
        purpose,
        status: "PENDING"
    });

    // Notify resource owner
    await notificationService.sendNotification(
        "RESOURCE_REQUEST",
        resource.owner.entityId,
        {
            requestId: request._id,
            resourceName: resource.name,
            requester: req.user.fullName
        }
    );

    return res.status(201).json(
        new ApiResponse(201, request, "Resource request submitted")
    );
});

export {
    listEquipment,
    shareMedicine,
    requestResource
};