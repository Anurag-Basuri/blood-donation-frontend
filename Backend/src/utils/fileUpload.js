import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";
import path from "path";

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Validates Cloudinary configuration
 * @returns {boolean} True if configuration is valid
 */
const validateConfig = () => {
    const requiredEnvVars = [
        "CLOUDINARY_CLOUD_NAME",
        "CLOUDINARY_API_KEY",
        "CLOUDINARY_API_SECRET",
    ];
    const missingVars = requiredEnvVars.filter(
        (varName) => !process.env[varName]
    );

    if (missingVars.length > 0) {
        console.error(
            `Missing required environment variables: ${missingVars.join(", ")}`
        );
        return false;
    }
    return true;
};

/**
 * Safely deletes a local file
 * @param {string} filePath - Path to the file to delete
 */
const safeDeleteFile = async (filePath) => {
    try {
        await fs.access(filePath);
        await fs.unlink(filePath);
        console.log(`Successfully deleted local file: ${filePath}`);
    } catch (error) {
        if (error.code !== "ENOENT") {
            console.warn(
                `Warning: Could not delete file ${filePath}:`,
                error.message
            );
        }
    }
};

/**
 * Uploads a file to Cloudinary with enhanced error handling and options
 * @param {string} localFilePath - Path to the local file
 * @param {Object} options - Upload options
 * @param {string} options.folder - Cloudinary folder to upload to
 * @param {string} options.publicId - Custom public ID for the file
 * @param {Array<string>} options.tags - Tags to add to the uploaded file
 * @param {boolean} options.keepLocal - Whether to keep the local file after upload
 * @param {string} options.resourceType - Resource type (auto, image, video, raw)
 * @param {Object} options.transformation - Transformation options
 * @returns {Promise<Object|null>} Cloudinary response or null on failure
 */
const uploadOnCloudinary = async (localFilePath, options = {}) => {
    // Validate configuration first
    if (!validateConfig()) {
        throw new Error("Cloudinary configuration is invalid");
    }

    // Validate input
    if (!localFilePath || typeof localFilePath !== "string") {
        throw new Error("Local file path is required and must be a string");
    }

    try {
        // Check if file exists
        await fs.access(localFilePath);

        // Get file stats for additional validation
        const stats = await fs.stat(localFilePath);
        if (!stats.isFile()) {
            throw new Error("Provided path is not a file");
        }

        // Prepare upload options
        const uploadOptions = {
            resource_type: options.resourceType || "auto",
            folder: options.folder,
            public_id: options.publicId,
            tags: options.tags,
            transformation: options.transformation,
            use_filename: true,
            unique_filename: !options.publicId, // Only use unique filename if no custom publicId
        };

        // Remove undefined options
        Object.keys(uploadOptions).forEach((key) => {
            if (uploadOptions[key] === undefined) {
                delete uploadOptions[key];
            }
        });

        console.log(
            `Uploading file to Cloudinary: ${path.basename(localFilePath)}`
        );

        const response = await cloudinary.uploader.upload(
            localFilePath,
            uploadOptions
        );

        // Delete local file after successful upload (unless keepLocal is true)
        if (!options.keepLocal) {
            await safeDeleteFile(localFilePath);
        }

        console.log(
            `Successfully uploaded to Cloudinary: ${response.public_id}`
        );

        return {
            success: true,
            data: response,
            url: response.secure_url,
            publicId: response.public_id,
            format: response.format,
            resourceType: response.resource_type,
        };
    } catch (error) {
        console.error("Error uploading file to Cloudinary:", {
            message: error.message,
            filePath: localFilePath,
            code: error.code,
        });

        // Always try to clean up the local file on error (unless keepLocal is true)
        if (!options.keepLocal) {
            await safeDeleteFile(localFilePath);
        }

        return {
            success: false,
            error: error.message,
            code: error.code,
        };
    }
};

/**
 * Uploads multiple files to Cloudinary
 * @param {Array<string>} filePaths - Array of file paths
 * @param {Object} options - Upload options (same as single upload)
 * @returns {Promise<Array>} Array of upload results
 */
const uploadMultipleToCloudinary = async (filePaths, options = {}) => {
    if (!Array.isArray(filePaths)) {
        throw new Error("File paths must be an array");
    }

    const uploadPromises = filePaths.map((filePath) =>
        uploadOnCloudinary(filePath, options)
    );

    try {
        const results = await Promise.allSettled(uploadPromises);
        return results.map((result, index) => ({
            filePath: filePaths[index],
            result:
                result.status === "fulfilled"
                    ? result.value
                    : { success: false, error: result.reason?.message },
        }));
    } catch (error) {
        console.error("Error in batch upload:", error);
        throw error;
    }
};

/**
 * Deletes a file from Cloudinary
 * @param {string} publicId - Public ID of the file to delete
 * @param {string} resourceType - Resource type (image, video, raw)
 * @returns {Promise<Object>} Deletion result
 */
const deleteFromCloudinary = async (publicId, resourceType = "image") => {
    try {
        if (!publicId) {
            throw new Error("Public ID is required");
        }

        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType,
        });

        return {
            success: result.result === "ok",
            result: result.result,
            publicId,
        };
    } catch (error) {
        console.error("Error deleting from Cloudinary:", error);
        return {
            success: false,
            error: error.message,
            publicId,
        };
    }
};

export {
    uploadOnCloudinary,
    uploadMultipleToCloudinary,
    deleteFromCloudinary,
    validateConfig,
};