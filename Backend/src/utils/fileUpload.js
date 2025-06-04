import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";
import path from "path";
import { ApiError } from "./ApiError.js";

// File type constants for blood donation system
const ALLOWED_FILE_TYPES = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "application/pdf": "pdf",
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Configure Cloudinary with error handling
const initializeCloudinary = () => {
    try {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
    } catch (error) {
        throw new ApiError(500, "Failed to initialize Cloudinary");
    }
};

/**
 * Validates file before upload
 * @param {string} filePath - Path to the file
 * @param {string} mimeType - File mime type
 */
const validateFile = async (filePath, mimeType) => {
    const stats = await fs.stat(filePath);

    if (!ALLOWED_FILE_TYPES[mimeType]) {
        throw new ApiError(
            400,
            `Invalid file type. Allowed types: ${Object.keys(
                ALLOWED_FILE_TYPES
            ).join(", ")}`
        );
    }

    if (stats.size > MAX_FILE_SIZE) {
        throw new ApiError(
            400,
            `File too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`
        );
    }
};

/**
 * Uploads a file to Cloudinary with blood donation specific options
 * @param {Object} fileData - File data object
 * @param {string} fileData.localPath - Local file path
 * @param {string} fileData.mimeType - File mime type
 * @param {string} fileData.category - File category (profile, document, report)
 * @param {string} fileData.entityId - ID of related entity (user, hospital, ngo)
 */
const uploadFile = async ({ localPath, mimeType, category, entityId }) => {
    try {
        await validateFile(localPath, mimeType);

        const uploadOptions = {
            folder: `blood-donation/${category}`,
            public_id: `${category}_${entityId}_${Date.now()}`,
            resource_type: "auto",
            tags: [category, entityId],
            transformation: getTransformationOptions(category),
        };

        const result = await cloudinary.uploader.upload(
            localPath,
            uploadOptions
        );
        await fs.unlink(localPath);

        return {
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
        };
    } catch (error) {
        await fs.unlink(localPath).catch(() => {});
        throw new ApiError(500, `File upload failed: ${error.message}`);
    }
};

/**
 * Gets transformation options based on file category
 */
const getTransformationOptions = (category) => {
    const options = {
        profile: {
            width: 400,
            height: 400,
            crop: "fill",
            quality: "auto",
        },
        document: {
            format: "pdf",
            quality: "auto",
        },
        report: {
            format: "pdf",
            quality: "auto",
        },
    };

    return options[category] || {};
};

/**
 * Deletes a file from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 */
const deleteFile = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result.result === "ok";
    } catch (error) {
        throw new ApiError(500, `File deletion failed: ${error.message}`);
    }
};

/**
 * Batch upload multiple files
 * @param {Array<Object>} files - Array of file objects
 */
const batchUpload = async (files) => {
    const results = await Promise.allSettled(
        files.map((file) => uploadFile(file))
    );

    return results.map((result, index) => ({
        file: files[index],
        ...(result.status === "fulfilled"
            ? { success: true, data: result.value }
            : { success: false, error: result.reason.message }),
    }));
};

export { initializeCloudinary, uploadFile, deleteFile, batchUpload };