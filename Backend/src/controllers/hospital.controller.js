import mongoose from "mongoose";
import { Hospital } from "../models/hospital.models.js";
import { BloodRequest } from "../models/bloodrequest.models.js";
import { NGO } from "../models/ngo.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadFile } from "../utils/fileUpload.js";
import { sendMail } from "../services/mail.service.js";

// Authentication
const registerHospital = asyncHandler(async (req, res) => {
    const {
        name,
        email,
        password,
        registrationNumber,
        address,
        contactPerson,
        type,
        specialties,
    } = req.body;

    // Validate required fields
    if (
        [name, email, password, registrationNumber].some(
            (field) => !field?.trim()
        )
    ) {
        throw new ApiError(400, "Required fields missing");
    }

    const existingHospital = await Hospital.findOne({
        $or: [{ email }, { registrationNumber }],
    });

    if (existingHospital) {
        throw new ApiError(409, "Hospital already registered");
    }

    const hospital = await Hospital.create({
        name,
        email,
        password,
        registrationNumber,
        address,
        contactPerson,
        type,
        specialties,
        status: "Pending",
    });

    if (req.files?.license) {
        hospital.license = await uploadFile({
            file: req.files.license,
            folder: "hospital-documents",
        });
        await hospital.save();
    }

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                { hospital },
                "Hospital registration pending verification"
            )
        );
});

// Blood Request Management
const createBloodRequest = asyncHandler(async (req, res) => {
    const { bloodGroups, urgencyLevel, requiredBy, patientInfo } = req.body;
    const hospitalId = req.hospital._id;

    const bloodRequest = await BloodRequest.create({
        hospitalId,
        bloodGroups,
        urgencyLevel,
        requiredBy,
        patientInfo,
        status: "Pending",
    });

    // Find nearby NGOs for the request
    const hospital = await Hospital.findById(hospitalId);
    const nearbyNGOs = await NGO.find({
        "address.location": {
            $near: {
                $geometry: hospital.address.location,
                $maxDistance: 50000, // 50km radius
            },
        },
        "bloodInventory.bloodGroup": {
            $in: bloodGroups.map((bg) => bg.bloodGroup),
        },
    }).select("email name");

    // Notify NGOs
    await Promise.all(
        nearbyNGOs.map((ngo) =>
            sendMail({
                to: ngo.email,
                subject: `Urgent Blood Request - ${bloodGroups
                    .map((bg) => bg.bloodGroup)
                    .join(", ")}`,
                html: `New blood request from ${hospital.name}`,
            })
        )
    );

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                { bloodRequest },
                "Blood request created successfully"
            )
        );
});

// Inventory Management
const updateBloodInventory = asyncHandler(async (req, res) => {
    const { bloodGroup, operation, units } = req.body;
    const hospitalId = req.hospital._id;

    const hospital = await Hospital.findById(hospitalId);
    const inventory = hospital.bloodInventory.find(
        (item) => item.bloodGroup === bloodGroup
    );

    if (!inventory && operation === "deduct") {
        throw new ApiError(400, "Insufficient blood units");
    }

    if (operation === "add") {
        if (!inventory) {
            hospital.bloodInventory.push({ bloodGroup, available: units });
        } else {
            inventory.available += units;
        }
    } else {
        if (inventory.available < units) {
            throw new ApiError(400, "Insufficient blood units");
        }
        inventory.available -= units;
    }

    await hospital.save();

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { inventory: hospital.bloodInventory },
                "Inventory updated successfully"
            )
        );
});

// Request Tracking
const getBloodRequests = asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 10 } = req.query;
    const hospitalId = req.hospital._id;

    const query = { hospitalId };
    if (status) query.status = status;

    const requests = await BloodRequest.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit)
        .populate("assignedDonations.donationId", "bloodGroup status");

    const total = await BloodRequest.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                requests,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalRequests: total,
                },
            },
            "Requests fetched successfully"
        )
    );
});

// NGO Network Management
const manageNGOConnections = asyncHandler(async (req, res) => {
    const { ngoId, action } = req.params;
    const hospitalId = req.hospital._id;

    const hospital = await Hospital.findById(hospitalId);
    const connection = hospital.connectedNGOs.find(
        (conn) => conn.ngoId.toString() === ngoId
    );

    switch (action) {
        case "connect":
            if (connection) {
                throw new ApiError(400, "Already connected with this NGO");
            }
            hospital.connectedNGOs.push({
                ngoId,
                status: "Pending",
                connectedDate: new Date(),
            });
            break;

        case "update-status":
            if (!connection) {
                throw new ApiError(404, "Connection not found");
            }
            connection.status = req.body.status;
            break;

        default:
            throw new ApiError(400, "Invalid action");
    }

    await hospital.save();

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { hospital },
                "NGO connection updated successfully"
            )
        );
});

export {
    registerHospital,
    createBloodRequest,
    updateBloodInventory,
    getBloodRequests,
    manageNGOConnections,
};
