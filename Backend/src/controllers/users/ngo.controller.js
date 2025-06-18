import mongoose from "mongoose";
import { NGO } from "../../models/users/ngo.models.js";
import {
    Facility,
    FACILITY_TYPE,
} from "../../models/donation/facility.models.js";
import { BloodRequest } from "../../models/donation/bloodrequest.models.js";
import { Activity } from "../../models/others/activity.model.js";
import { Notification } from "../../models/others/notification.model.js";
import { User } from "../../models/users/user.models.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { uploadFile, deleteFile } from "../../utils/fileUpload.js";
import notificationService from "../../services/notification.service.js";

// Enums and Constants
export const NGO_STATUS = {
    PENDING: "PENDING",
    ACTIVE: "ACTIVE",
    SUSPENDED: "SUSPENDED",
    BLACKLISTED: "BLACKLISTED",
};

export const FACILITY_OPERATIONS = {
    CREATE: "create",
    UPDATE: "update",
    DELETE: "delete",
    SUSPEND: "suspend",
    ACTIVATE: "activate",
    LIST: "LIST",
};

// Helper: Generate tokens for NGO
const generateTokens = async (ngoId) => {
    const ngo = await NGO.findById(ngoId);
    const accessToken = ngo.generateAccessToken();
    const refreshToken = ngo.generateRefreshToken();

    ngo.refreshToken = refreshToken;
    ngo.lastLogin = new Date();
    await ngo.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
};

// Registration
const registerNGO = asyncHandler(async (req, res) => {
    const {
        name,
        email,
        contactPerson,
        address,
        regNumber,
        affiliation,
        establishedYear,
        license,
        password,
    } = req.body;

    // Validation
    if (!name?.trim()) throw new ApiError(400, "NGO name is required");
    if (!email?.trim()) throw new ApiError(400, "Email is required");
    if (!password?.trim() || password.length < 8)
        throw new ApiError(400, "Password must be at least 8 characters");
    if (!contactPerson?.name || !contactPerson?.phone)
        throw new ApiError(400, "Contact person details are required");
    if (!regNumber?.trim())
        throw new ApiError(400, "Registration number is required");
    if (!address?.city || !address?.state || !address?.pinCode || !address?.coordinates)
        throw new ApiError(400, "Complete address including coordinates is required");

    // Check for existing NGO
    const existingNGO = await NGO.findOne({ $or: [{ email }, { regNumber }] });
    if (existingNGO) {
        throw new ApiError(
            409,
            existingNGO.email === email
                ? "Email already registered"
                : "Registration number already exists"
        );
    }

    // Create NGO
    const ngo = await NGO.create({
        name,
        email,
        password,
        contactPerson,
        address: {
            ...address,
            location: {
                type: "Point",
                coordinates: address.coordinates,
            },
        },
        regNumber,
        affiliation,
        establishedYear,
        license,
        lastLogin: new Date(),
    });

    // Log activity
    await Activity.create({
        type: "NGO_REGISTERED",
        performedBy: { userId: ngo._id, userModel: "NGO" },
        details: {
            ngoId: ngo._id,
            name: ngo.name,
            registrationIP: req.ip,
            timestamp: new Date(),
        },
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            {
                ngo: {
                    _id: ngo._id,
                    name: ngo.name,
                    email: ngo.email,
                    status: ngo.isVerified ? "Verified" : "Pending Verification",
                },
            },
            "NGO registration submitted for verification"
        )
    );
});

// Login
const loginNGO = asyncHandler(async (req, res) => {
    const { regNumber, email, password } = req.body;
    if (!regNumber && !email) {
        throw new ApiError(400, "Email or Registration Number is required");
    }

    if (!password || password.length < 8) {
        throw new ApiError(400, "Password must be at least 8 characters");
    }

    const ngo = await NGO.findOne({ $or: [{ email }, { regNumber }] });
    if (!ngo) throw new ApiError(404, "NGO not found");

    const isMatch = await ngo.comparePassword(password);
    if (!isMatch) throw new ApiError(401, "Invalid credentials");

    const tokens = await generateTokens(ngo._id);

    return res
        .status(200)
        .json(new ApiResponse(200, { ngo, ...tokens }, "Login successful"));
});

// Logout
const logoutNGO = asyncHandler(async (req, res) => {
    const ngoId = req.ngo._id;
    const ngo = await NGO.findById(ngoId);
    if (!ngo) throw new ApiError(404, "NGO not found");

    ngo.refreshToken = null;
    await ngo.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, {}, "Logout successful"));
});

// Change Password
const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const ngoId = req.ngo._id;

    if (!oldPassword || !newPassword)
        throw new ApiError(400, "Old and new passwords are required");

    const ngo = await NGO.findById(ngoId);
    if (!ngo) throw new ApiError(404, "NGO not found");

    const isMatch = await ngo.comparePassword(oldPassword);
    if (!isMatch) throw new ApiError(401, "Old password is incorrect");

    ngo.password = newPassword;
    await ngo.save();

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password updated successfully"));
});

// Upload documents
const uploadDocuments = asyncHandler(async (req, res) => {
    const { documentType } = req.params;
    const ngoId = req.user._id;

    const allowedTypes = [
        "aadhaarCard",
        "panCard",
        "gstCertificate",
        "licenseDocument",
    ];
    if (!allowedTypes.includes(documentType)) {
        throw new ApiError(400, "Invalid document type");
    }

    const ngo = await NGO.findById(ngoId);
    if (!ngo) throw new ApiError(404, "NGO not found");

    const currentDoc = ngo.documents[documentType];

    // Prevent re-upload unless REJECTED or not uploaded yet
    if (currentDoc?.url && currentDoc.status !== "REJECTED") {
        throw new ApiError(403, `Cannot re-upload ${documentType}. It is not rejected.`);
    }

    // Proceed with upload (you must already have req.file if using multer)
    const uploaded = await uploadToCloudinary(req.file.path, "documents");

    // Update document with new info
    ngo.documents[documentType] = {
        url: uploaded.secure_url,
        publicId: uploaded.public_id,
        uploadedAt: new Date(),
        status: "PENDING", // Reset to pending on re-upload
    };

    await ngo.save();
    return res.status(200).json(
        new ApiResponse(200, ngo.documents[documentType], `${documentType} uploaded successfully`)
    );
});

// Upload logo
const uploadLogo = asyncHandler(async (req, res) => {
    const ngoId = req.ngo._id;

    // Fetch current NGO to get existing logo publicId
    const ngo = await NGO.findById(ngoId);
    if (!ngo) throw new ApiError(404, "NGO not found");

    // Check if file is present
    const file = req.files?.logo?.[0];
    if (!file) {
        throw new ApiError(400, "Logo file is required");
    }

    // Delete existing logo from Cloudinary if present
    const existingLogo = ngo.logo;
    if (existingLogo && existingLogo.publicId) {
        try {
            await deleteFile(existingLogo.publicId);
        } catch (err) {
            console.error("Failed to delete old logo:", err.message);
        }
    }

    // Upload new logo
    const uploadedLogo = await uploadFile({
        file,
        folder: `ngo-logos`,
    });

    // Update NGO with new logo
    ngo.logo = uploadedLogo;
    await ngo.save();

    return res
        .status(200)
        .json(new ApiResponse(200, ngo, "Logo uploaded successfully"));
});

// Update NGO Profile
const updateNGOProfile = asyncHandler(async (req, res) => {
    const ngoId = req.ngo._id;
    const {
        name,
        email,
        contactPerson,
        address,
        regNumber,
        affiliation,
        establishedYear,
        license,
        operatingHours,
        facilities,
    } = req.body;

    // Validation
    if (!name?.trim()) throw new ApiError(400, "NGO name is required");
    if (!email?.trim()) throw new ApiError(400, "Email is required");
    if (!contactPerson?.name || !contactPerson?.phone)
        throw new ApiError(400, "Contact person details are required");
    if (!address?.city || !address?.state || !address?.pinCode || !address?.coordinates)
        throw new ApiError(400, "Complete address including coordinates is required");
    if (!regNumber?.trim())
        throw new ApiError(400, "Registration number is required");
    if (!affiliation?.trim())
        throw new ApiError(400, "Affiliation is required");
    if (!operatingHours?.trim())
        throw new ApiError(400, "Operating hours are required");
    if (!facilities?.length)
        throw new ApiError(400, "At least one facility is required");

    const ngo = await NGO.findById(ngoId);

    if (!ngo) throw new ApiError(404, "NGO not found");
    if (ngo.status === NGO_STATUS.BLACKLISTED) {
        throw new ApiError(403, "Blacklisted NGOs cannot update profile");
    }

    // Check for existing NGO with same email or regNumber
    const existingNGO = await NGO.findOne({
        $or: [{ email }, { regNumber }],
        _id: { $ne: ngoId },
    });

    if (existingNGO) {
        throw new ApiError(
            409,
            existingNGO.email === email
                ? "Email already registered"
                : "Registration number already exists"
        );
    }

    // Update NGO details
    if (name !== undefined && name !== null)
        ngo.name = name;
    if (email !== undefined && email !== null)
        ngo.email = email;
    if (contactPerson !== undefined && contactPerson !== null)
        ngo.contactPerson = contactPerson;
    if (address !== undefined && address !== null)
        ngo.address = address;
    if (regNumber !== undefined && regNumber !== null)
        ngo.regNumber = regNumber;
    if (affiliation !== undefined && affiliation !== null)
        ngo.affiliation = affiliation;
    if (establishedYear !== undefined && establishedYear !== null)
        ngo.establishedYear = establishedYear;
    if (license !== undefined && license !== null)
        ngo.license = license;
    if (operatingHours !== undefined && operatingHours !== null)
        ngo.operatingHours = operatingHours;
    if (facilities !== undefined && facilities !== null)
        ngo.facilities = facilities;

    await ngo.save();
    return res
        .status(200)
        .json(
            new ApiResponse
                (200, ngo, "NGO profile updated successfully")
        );
});

// Blood Inventory Management
const manageBloodInventory = asyncHandler(async (req, res) => {
    const ngoId = req.user._id;
    const { bloodGroup, units, operation } = req.body;

    if (!bloodGroup || typeof units !== "number" || !["add", "subtract", "set"].includes(operation)) {
        throw new ApiError(400, "Invalid input. Must include bloodGroup, units (number), and a valid operation.");
    }

    const ngo = await NGO.findById(ngoId);
    if (!ngo) throw new ApiError(404, "NGO not found");

    await ngo.updateBloodStock(bloodGroup, units, operation);

    return res
        .status(200)
        .json(
        new ApiResponse(
            200, ngo.bloodInventory, `Blood inventory updated: ${operation} ${units} unit(s) of ${bloodGroup}`
        )
    );
});

// Statistics
const getStatistics = asyncHandler(async (req, res) => {
    const ngo = await NGO.findById(req.user._id).select("statistics");
    if (!ngo) throw new ApiError(404, "NGO not found");

    return res
        .status(200)
        .json(
            new ApiResponse(
                200, ngo.statistics, "NGO statistics fetched."
            )
        );
});

// Recalculate Statistics
const recalculateStatistics = asyncHandler(async (req, res) => {
    const ngo = await NGO.findById(req.user._id);
    if (!ngo) throw new ApiError(404, "NGO not found");

    await ngo.calculateStatistics();
    return res
        .status(200)
        .json(
            new ApiResponse(
                200, ngo.statistics, "Statistics recalculated."
            )
        );
});

// Settings Management
const getSettings = asyncHandler(async (req, res) => {
    const ngo = await NGO.findById(req.user._id).select("settings");
    if (!ngo) throw new ApiError(404, "NGO not found");

    return res
        .status(200)
        .json(
            new ApiResponse(
                200, ngo.settings, "Settings retrieved."
            )
        );
});

// Update Settings
const updateSettings = asyncHandler(async (req, res) => {
    const { settings } = req.body;
    const ngo = await NGO.findById(req.user._id);

    if (!ngo) throw new ApiError(404, "NGO not found");
    if (typeof settings !== "object") throw new ApiError(400, "Invalid settings format");

    ngo.settings = { ...ngo.settings.toObject(), ...settings };
    await ngo.save();

    return res
        .status(200)
        .json(
            new ApiResponse(
                200, ngo.settings, "Settings updated."
            )
        );
});

// get NGO Profile
const getNGOProfile = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const ngo = await NGO.findById(id)
        .select("name email logo address contactPerson facilities bloodInventory statistics connectedHospitals");

    if (!ngo) {
        throw new ApiError(404, "NGO not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200, ngo, "NGO profile fetched successfully"
            )
        );
});

// Get current NGO
const getCurrentNGO = asyncHandler(async (req, res) => {
    const ngo = await NGO.findById(req.user._id).select("-password -refreshToken");

    if (!ngo) {
        throw new ApiError(404, "NGO not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200, ngo, "Current NGO fetched successfully"
            )
        );
});

// Facility Management
const manageFacility = asyncHandler(async (req, res) => {
    const { action } = req.params;
    const ngoId = req.ngo._id;

    if (req.ngo.status !== NGO_STATUS.ACTIVE) {
        throw new ApiError(403, "NGO must be active to manage facilities");
    }

    if (action === FACILITY_OPERATIONS.CREATE) {
        const facility = await Facility.create({
            ...req.body,
            ngoId,
            facilityType:
                req.body.type === "CAMP"
                    ? FACILITY_TYPE.CAMP
                    : FACILITY_TYPE.CENTER,
            status: req.body.type === "CAMP" ? "PLANNED" : "INACTIVE",
            location: {
                type: "Point",
                coordinates: [req.body.longitude, req.body.latitude],
            },
        });

        if (facility.facilityType === FACILITY_TYPE.CAMP) {
            await notifyNearbyDonors(facility);
        }

        return res
            .status(201)
            .json(
                new ApiResponse(201, facility, "Facility created successfully")
            );
    }

    if (action === FACILITY_OPERATIONS.LIST) {
        const facilities = await Facility.find({ ngoId });
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    facilities,
                    "Facilities fetched successfully"
                )
            );
    }

    const facility = await Facility.findOne({
        _id: req.params.facilityId,
        ngoId,
    });
    if (!facility) throw new ApiError(404, "Facility not found");

    switch (action) {
        case FACILITY_OPERATIONS.UPDATE:
            Object.assign(facility, req.body);
            await facility.save();
            break;
        case FACILITY_OPERATIONS.DELETE:
            await facility.deleteOne();
            break;
        case FACILITY_OPERATIONS.SUSPEND:
        case FACILITY_OPERATIONS.ACTIVATE:
            facility.status =
                action === FACILITY_OPERATIONS.SUSPEND ? "SUSPENDED" : "ACTIVE";
            await facility.save();
            break;
        default:
            throw new ApiError(400, "Invalid operation");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, facility, `Facility ${action}d successfully`)
        );
});

// Blood Request Management
const handleBloodRequest = asyncHandler(async (req, res) => {
    const { requestId } = req.params;
    const { action, notes, assignedDonors } = req.body;
    const ngoId = req.ngo._id;

    const request = await BloodRequest.findOne({ _id: requestId }).populate(
        "hospitalId",
        "name address contactInfo"
    );
    if (!request) throw new ApiError(404, "Blood request not found");

    await request.updateStatus(action, ngoId, notes);

    // Handle different actions
    if (action === "ACCEPTED" && assignedDonors) {
        // Assign donors logic here if needed
    }
    // Add logic for COMPLETED, REJECTED, etc. as needed

    return res
        .status(200)
        .json(new ApiResponse(200, request, "Request handled successfully"));
});

// Hospital Connections
const getConnectedHospitals = asyncHandler(async (req, res) => {
    // Implement logic to fetch connected hospitals
    return res
        .status(200)
        .json(new ApiResponse(200, [], "Connected hospitals fetched (stub)"));
});

// Respond to Hospital Connection Request
const respondToConnectionRequest = asyncHandler(async (req, res) => {
    // Implement logic to respond to hospital connection requests
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Connection response handled (stub)"));
});

// Analytics & Reports
const getNGOAnalytics = asyncHandler(async (req, res) => {
    // Implement analytics logic here
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Analytics fetched (stub)"));
});

// Helper: Notify nearby donors for new camp
const notifyNearbyDonors = async (facility) => {
    const nearbyUsers = await User.find({
        "address.location": {
            $near: {
                $geometry: facility.location,
                $maxDistance: 10000, // 10km radius
            },
        },
        donorStatus: "Active",
        notificationPreferences: {
            $elemMatch: { type: "CAMP_ANNOUNCEMENTS", enabled: true },
        },
    }).select("_id email phone");

    await notificationService.sendBulkNotifications(
        nearbyUsers,
        "NEW_FACILITY_ANNOUNCEMENT",
        {
            facilityId: facility._id,
            facilityName: facility.name,
            facilityType: facility.facilityType,
            startDate: facility.schedule?.startDate,
            location: facility.address,
        }
    );
};

export {
    registerNGO,
    loginNGO,
    logoutNGO,
    changePassword,
    uploadDocuments,
    uploadLogo,
    updateNGOProfile,
    manageBloodInventory,
    getStatistics,
    recalculateStatistics,
    getSettings,
    updateSettings,
    getCurrentNGO,
    getNGOProfile,
    manageFacility,
    handleBloodRequest,
    getConnectedHospitals,
    respondToConnectionRequest,
    getNGOAnalytics
};