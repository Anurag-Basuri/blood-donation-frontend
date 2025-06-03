import { ApiError } from "../src/utils/ApiError.js";
import { ApiResponse } from "../src/utils/ApiResponse.js";

export class BaseController {
    constructor() {
        if (this.constructor === BaseController) {
            throw new Error("Abstract class cannot be instantiated");
        }
    }

    sendResponse(res, statusCode, data, message) {
        return res
            .status(statusCode)
            .json(new ApiResponse(statusCode, data, message));
    }

    handlePagination(page = 1, limit = 10) {
        const parsedPage = parseInt(page);
        const parsedLimit = parseInt(limit);
        const skip = (parsedPage - 1) * parsedLimit;

        return {
            skip,
            limit: parsedLimit,
            page: parsedPage,
        };
    }

    getPaginationInfo(total, page, limit, count) {
        return {
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            hasNextPage: (page - 1) * limit + count < total,
            hasPrevPage: page > 1,
        };
    }

    validateGeoCoordinates(coordinates) {
        if (
            !Array.isArray(coordinates) ||
            coordinates.length !== 2 ||
            typeof coordinates[0] !== "number" ||
            typeof coordinates[1] !== "number"
        ) {
            throw new ApiError(400, "Invalid coordinates format");
        }
    }
}
