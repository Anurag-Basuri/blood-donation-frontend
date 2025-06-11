import { Medicine } from "../../models/sharing/medicine.models.js";
import { Hospital } from "../../models/users/hospital.models.js";
import { Activity } from "../../models/others/activity.model.js";
import notificationService from "../../services/notification.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

const MEDICINE_STATUS = {
    AVAILABLE: "AVAILABLE",
    LOW_STOCK: "LOW_STOCK",
    OUT_OF_STOCK: "OUT_OF_STOCK",
    EXPIRED: "EXPIRED",
    RESERVED: "RESERVED"
};

// List medicines with filtering
const listMedicines = asyncHandler(async (req, res) => {
    const {
        category,
        location,
        radius = 10,
        expiryAfter,
        prescriptionRequired,
        sortBy = "expiry",
        page = 1,
        limit = 10
    } = req.query;

    const query = {
        "status.current": { $in: [MEDICINE_STATUS.AVAILABLE, MEDICINE_STATUS.LOW_STOCK] },
        "expiry.expiryDate": { $gt: expiryAfter || new Date() }
    };

    if (category) query["details.category"] = category;
    if (prescriptionRequired !== undefined) {
        query["details.prescriptionRequired"] = prescriptionRequired;
    }

    if (location) {
        query.location = {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: [location.longitude, location.latitude]
                },
                $maxDistance: radius * 1000
            }
        };
    }

    const sortOptions = {
        expiry: { "expiry.expiryDate": 1 },
        quantity: { "quantity.available": -1 },
        recentlyAdded: { createdAt: -1 }
    };

    const medicines = await Medicine.find(query)
        .populate("donor.entityId", "name contactInfo")
        .sort(sortOptions[sortBy])
        .skip((page - 1) * limit)
        .limit(limit);

    const total = await Medicine.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(200, {
            medicines,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total
            }
        }, "Medicines fetched successfully")
    );
});

// Add new medicine
const addMedicine = asyncHandler(async (req, res) => {
    const {
        name,
        category,
        details,
        expiryDate,
        quantity,
        location,
        storage,
        prescriptionRequired
    } = req.body;

    // Validation
    if (!name || !category || !expiryDate || !quantity) {
        throw new ApiError(400, "Missing required fields");
    }

    if (new Date(expiryDate) <= new Date()) {
        throw new ApiError(400, "Medicine has already expired");
    }

    const medicine = await Medicine.create({
        name,
        details: {
            ...details,
            category,
            prescriptionRequired
        },
        expiry: {
            manufacturingDate: new Date(),
            expiryDate: new Date(expiryDate)
        },
        quantity: {
            available: quantity,
            unit: "units"
        },
        storage,
        location,
        donor: {
            entityId: req.user._id,
            entityType: req.user.role
        },
        status: {
            current: MEDICINE_STATUS.AVAILABLE,
            lastUpdated: new Date()
        }
    });

    // Log activity
    await Activity.create({
        type: "MEDICINE_ADDED",
        performedBy: {
            userId: req.user._id,
            userModel: req.user.role
        },
        details: {
            medicineId: medicine._id,
            name,
            quantity
        }
    });

    // Notify nearby hospitals if essential medicine
    if (category === "ESSENTIAL") {
        await notifyNearbyFacilities(medicine);
    }

    return res.status(201).json(
        new ApiResponse(201, medicine, "Medicine added successfully")
    );
});

// Update medicine status
const updateMedicineStatus = asyncHandler(async (req, res) => {
    const { medicineId } = req.params;
    const { status, quantity, notes } = req.body;

    const medicine = await Medicine.findById(medicineId);
    if (!medicine) {
        throw new ApiError(404, "Medicine not found");
    }

    if (quantity !== undefined) {
        medicine.quantity.available = Math.max(0, quantity);
        medicine.status.current = quantity === 0 ? 
            MEDICINE_STATUS.OUT_OF_STOCK : 
            quantity <= medicine.quantity.threshold ? 
                MEDICINE_STATUS.LOW_STOCK : 
                MEDICINE_STATUS.AVAILABLE;
    }

    if (status) {
        await medicine.updateStatus(status, req.user._id, notes);
    }

    // Check expiry
    if (new Date(medicine.expiry.expiryDate) <= new Date()) {
        medicine.status.current = MEDICINE_STATUS.EXPIRED;
    }

    await medicine.save();

    return res.status(200).json(
        new ApiResponse(200, medicine, "Medicine updated successfully")
    );
});

// Get medicine analytics
const getMedicineAnalytics = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;

    const analytics = await Medicine.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            }
        },
        {
            $group: {
                _id: "$details.category",
                totalQuantity: { $sum: "$quantity.available" },
                averageQuantity: { $avg: "$quantity.available" },
                expiringCount: {
                    $sum: {
                        $cond: [
                            { 
                                $lte: [
                                    "$expiry.expiryDate", 
                                    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                                ] 
                            },
                            1,
                            0
                        ]
                    }
                }
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(200, { analytics }, "Analytics fetched successfully")
    );
});

// Helper function to notify nearby facilities
const notifyNearbyFacilities = async (medicine) => {
    const nearbyHospitals = await Hospital.find({
        "address.location": {
            $near: {
                $geometry: medicine.location,
                $maxDistance: 50000 // 50km radius
            }
        },
        isVerified: true
    }).select("_id name");

    const notifications = nearbyHospitals.map(hospital => ({
        type: "MEDICINE_AVAILABLE",
        recipient: hospital._id,
        recipientModel: "Hospital",
        data: {
            medicineId: medicine._id,
            name: medicine.name,
            category: medicine.details.category,
            quantity: medicine.quantity.available,
            expiryDate: medicine.expiry.expiryDate
        }
    }));

    await notificationService.sendBulkNotifications(notifications);
};

export {
    listMedicines,
    addMedicine,
    updateMedicineStatus,
    getMedicineAnalytics,
    MEDICINE_STATUS
};