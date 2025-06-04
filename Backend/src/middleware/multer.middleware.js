import multer from "multer";
import path from "path";
import { ApiError } from "../utils/ApiError.js";

// Define allowed file types
const ALLOWED_FILE_TYPES = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "application/pdf": "pdf",
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = ALLOWED_FILE_TYPES[file.mimetype];
    cb(null, `${file.fieldname}-${uniqueSuffix}.${fileExtension}`);
  },
});

// File filter function
const fileFilter = (req, file, cb) => {
  if (!ALLOWED_FILE_TYPES[file.mimetype]) {
    return cb(
      new ApiError(
        400,
        `Invalid file type. Allowed types: ${Object.keys(ALLOWED_FILE_TYPES).join(
          ", "
        )}`
      ),
      false
    );
  }
  cb(null, true);
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 5, // maximum number of files
  },
});

// Helper functions for different upload scenarios
export const uploadSingle = (fieldName) => upload.single(fieldName);

export const uploadMultiple = (fieldName, maxCount = 5) =>
  upload.array(fieldName, maxCount);

export const uploadFields = (fields) => upload.fields(fields);

// Error handling middleware for multer errors
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return next(
        new ApiError(
          400,
          `File too large. Max size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`
        )
      );
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return next(new ApiError(400, "Too many files uploaded"));
    }
    return next(new ApiError(400, err.message));
  }
  next(err);
};

// Usage examples:
/*
Single file upload
router.post('/upload/single', 
  uploadSingle('profile'), 
  handleMulterError,
  uploadController.handleSingleUpload
);

Multiple files upload
router.post('/upload/multiple', 
  uploadMultiple('documents'), 
  handleMulterError,
  uploadController.handleMultipleUpload
);

Multiple fields upload
router.post('/upload/fields',
  uploadFields([
    { name: 'avatar', maxCount: 1 },
    { name: 'documents', maxCount: 3 }
  ]),
  handleMulterError,
  uploadController.handleFieldsUpload
);
*/
