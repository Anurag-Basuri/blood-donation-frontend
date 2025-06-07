import mongoose from "mongoose";
import { NGO } from "../../models/ngo.models.js";
import { Center } from "../models/center.models.js";
import { BloodDonation } from "../models/blood.models.js";
import { DonationCamp } from "../models/camp.models.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { uploadFile } from "../../utils/fileUpload.js";
import { sendMail } from "../services/mail.service.js";

// Authentication Controllers
const registerNGO = asyncHandler(async (req, res) => {
    const { name, email, password, contactPerson, address, regNumber } =
        req.body;

    // Validate required fields
    if (
        [name, email, password, contactPerson?.name, regNumber].some(
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
    });

    // Handle document uploads
    if (req.files?.registrationCert) {
        ngo.registrationDocument = await uploadFile({
            file: req.files.registrationCert,
            folder: "ngo-documents",
        });
        await ngo.save();
    }

    return res
        .status(201)
        .json(new ApiResponse(201, { ngo }, "NGO registered successfully"));
});

// Center Management
const manageDonationCenter = asyncHandler(async (req, res) => {
    const { action } = req.params;
    const ngoId = req.ngo._id;

    const result = await (action === "create"
        ? Center.create({ ...req.body, ngoId })
        : Center.findOneAndUpdate(
              { _id: req.params.centerId, ngoId },
              { $set: req.body },
              { new: true }
          ));

    if (!result && action !== "create") {
        throw new ApiError(404, "Center not found");
    }

    return res
        .status(action === "create" ? 201 : 200)
        .json(
            new ApiResponse(
                action === "create" ? 201 : 200,
                { center: result },
                `Center ${action}d successfully`
            )
        );
});

// Campaign Management
const manageDonationCampaign = asyncHandler(async (req, res) => {
    const ngoId = req.ngo._id;
    const { action } = req.params;

    if (action === "schedule") {
        const campaign = await DonationCamp.create({
            ...req.body,
            ngoId,
            status: "Planned",
        });

        // Notify nearby donors
        await sendMail({
            to: req.body.notifyEmails,
            subject: "New Blood Donation Camp",
            html: `Camp scheduled for ${new Date(
                campaign.date
            ).toLocaleDateString()}`,
        });

        return res
            .status(201)
            .json(
                new ApiResponse(
                    201,
                    { campaign },
                    "Campaign scheduled successfully"
                )
            );
    }

    const campaigns = await DonationCamp.find({ ngoId })
        .sort({ date: -1 })
        .select("name date status location");

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { campaigns },
                "Campaigns fetched successfully"
            )
        );
});

// Blood Inventory Management
const manageBloodInventory = asyncHandler(async (req, res) => {
    const { centerId } = req.params;
    const inventory = await BloodDonation.aggregate([
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
                { inventory },
                "Inventory fetched successfully"
            )
        );
});

export {
    registerNGO,
    manageDonationCenter,
    manageDonationCampaign,
    manageBloodInventory,
};