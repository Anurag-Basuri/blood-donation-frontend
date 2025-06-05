import mongoose from "mongoose";
import { NGO } from "../models/ngo.models.js";
import { Center } from "../models/center.models.js";
import { BloodDonation } from "../models/blood.models.js";
import { DonationCamp } from "../models/camp.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadFile, deleteFile } from "../utils/fileUpload.js";
import { sendMail } from "../services/mail.service.js";

// Authentication Controllers
const registerNGO = asyncHandler(async (req, res) => {
    const {
        name,
        email,
        password,
        contactPerson,
        address,
        regNumber,
        affiliation,
    } = req.body;

    // Validate required fields
    if (
        [name, email, password, contactPerson?.name, contactPerson?.phone].some(
            (field) => !field?.trim()
        )
    ) {
        throw new ApiError(400, "All required fields must be provided");
    }

    // Check if NGO already exists
    const existingNGO = await NGO.findOne({
        $or: [{ email }, { regNumber }],
    });

    if (existingNGO) {
        throw new ApiError(
            409,
            existingNGO.email === email
                ? "NGO with email already exists"
                : "Registration number already registered"
        );
    }

    // Create NGO
    const ngo = await NGO.create({
        name,
        email,
        password,
        contactPerson,
        address,
        regNumber,
        affiliation,
    });

    // Handle document uploads
    if (req.files?.registrationCert) {
        const certFile = req.files.registrationCert;
        const uploadResult = await uploadFile({
            localPath: certFile.path,
            mimeType: certFile.mimetype,
            category: "registration",
            entityId: ngo._id,
        });
        ngo.registrationDocument = uploadResult.url;
        await ngo.save();
    }

    return res
        .status(201)
        .json(new ApiResponse(201, { ngo }, "NGO registered successfully"));
});

// Center Management
const manageDonationCenter = asyncHandler(async (req, res) => {
    const { action, centerId } = req.params;
    const ngoId = req.ngo._id;

    switch (action) {
        case "create":
            const center = await Center.create({
                ...req.body,
                ngoId,
                status: "Active",
            });
            return res
                .status(201)
                .json(
                    new ApiResponse(
                        201,
                        { center },
                        "Center created successfully"
                    )
                );

        case "update":
            const updatedCenter = await Center.findOneAndUpdate(
                { _id: centerId, ngoId },
                { $set: req.body },
                { new: true }
            );
            if (!updatedCenter) {
                throw new ApiError(404, "Center not found");
            }
            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        { center: updatedCenter },
                        "Center updated successfully"
                    )
                );

        default:
            throw new ApiError(400, "Invalid action");
    }
});

// Campaign Management
const manageDonationCampaign = asyncHandler(async (req, res) => {
    const ngoId = req.ngo._id;
    const { action } = req.params;

    switch (action) {
        case "schedule":
            const campaign = await DonationCamp.create({
                ...req.body,
                ngoId,
                status: "Planned",
            });

            // Send notifications to nearby donors
            const nearbyDonors = await User.find({
                "address.location": {
                    $near: {
                        $geometry: campaign.location,
                        $maxDistance: 10000, // 10km radius
                    },
                },
            });

            // Schedule notifications
            await Promise.all(
                nearbyDonors.map((donor) =>
                    sendMail({
                        to: donor.email,
                        subject: "New Blood Donation Camp Near You",
                        html: `A blood donation camp is scheduled on 
                           ${campaign.date.toLocaleDateString()}`,
                    })
                )
            );

            return res
                .status(201)
                .json(
                    new ApiResponse(
                        201,
                        { campaign },
                        "Campaign scheduled successfully"
                    )
                );

        case "list":
            const campaigns = await DonationCamp.find({ ngoId })
                .sort({ date: -1 })
                .populate("centerId", "name address");
            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        { campaigns },
                        "Campaigns fetched successfully"
                    )
                );

        default:
            throw new ApiError(400, "Invalid action");
    }
});

// Blood Inventory Management
const manageBloodInventory = asyncHandler(async (req, res) => {
    const { centerId } = req.params;
    const ngoId = req.ngo._id;

    const center = await Center.findOne({ _id: centerId, ngoId });
    if (!center) {
        throw new ApiError(404, "Center not found");
    }

    const bloodStats = await BloodDonation.aggregate([
        {
            $match: {
                centerId: mongoose.Types.ObjectId(centerId),
                status: "available",
            },
        },
        {
            $group: {
                _id: "$bloodGroup",
                available: { $sum: 1 },
                expiring: {
                    $sum: {
                        $cond: [
                            {
                                $lte: [
                                    "$expiryDate",
                                    new Date(
                                        Date.now() + 7 * 24 * 60 * 60 * 1000
                                    ),
                                ],
                            },
                            1,
                            0,
                        ],
                    },
                },
            },
        },
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { inventory: bloodStats },
                "Inventory fetched successfully"
            )
        );
});

// Hospital Network Management
const manageHospitalNetwork = asyncHandler(async (req, res) => {
    const { action, hospitalId } = req.params;
    const ngoId = req.ngo._id;

    const ngo = await NGO.findById(ngoId);
    if (!ngo) {
        throw new ApiError(404, "NGO not found");
    }

    switch (action) {
        case "connect":
            const existingConnection = ngo.connectedHospitals.find(
                (conn) => conn.hospitalId.toString() === hospitalId
            );

            if (existingConnection) {
                throw new ApiError(400, "Already connected with this hospital");
            }

            ngo.connectedHospitals.push({
                hospitalId,
                status: "Pending",
                connectedDate: new Date(),
            });
            await ngo.save();

            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        null,
                        "Connection request sent successfully"
                    )
                );

        case "update-status":
            const { status } = req.body;
            const connection = ngo.connectedHospitals.id(hospitalId);
            if (!connection) {
                throw new ApiError(404, "Hospital connection not found");
            }

            connection.status = status;
            await ngo.save();

            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        { connection },
                        "Connection status updated successfully"
                    )
                );

        default:
            throw new ApiError(400, "Invalid action");
    }
});

export {
    registerNGO,
    manageDonationCenter,
    manageDonationCampaign,
    manageBloodInventory,
    manageHospitalNetwork,
};
