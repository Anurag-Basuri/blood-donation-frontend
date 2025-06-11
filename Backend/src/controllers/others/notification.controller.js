import {
    Notification,
    NOTIFICATION_STATUS,
} from "../../models/others/notification.model.js";
import notificationService from "../../services/notification.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

// Get user notifications with filtering
const getNotifications = asyncHandler(async (req, res) => {
    const {
        status,
        type,
        page = 1,
        limit = 20,
        sortBy = "createdAt",
    } = req.query;

    const query = {
        recipient: req.user._id,
        ...(status && { status }),
        ...(type && { type }),
    };

    const notifications = await Notification.find(query)
        .sort({ [sortBy]: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    const total = await Notification.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                notifications,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                },
            },
            "Notifications fetched successfully"
        )
    );
});

// Mark notification as read
const markAsRead = asyncHandler(async (req, res) => {
    const { notificationId } = req.params;

    const notification = await Notification.findOne({
        _id: notificationId,
        recipient: req.user._id,
    });

    if (!notification) {
        throw new ApiError(404, "Notification not found");
    }

    await notification.markAsRead();

    return res
        .status(200)
        .json(
            new ApiResponse(200, notification, "Notification marked as read")
        );
});

// Mark all notifications as read
const markAllAsRead = asyncHandler(async (req, res) => {
    const result = await Notification.markAllAsRead(req.user._id);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                updated: result.modifiedCount,
            },
            "All notifications marked as read"
        )
    );
});

// Get notification preferences
const getPreferences = asyncHandler(async (req, res) => {
    const preferences = req.user.notificationPreferences || {
        email: true,
        sms: true,
        push: false,
        types: {
            "urgent-blood-request": { email: true, sms: true, push: true },
            "donation-reminder": { email: true, sms: true, push: false },
            "appointment-confirmation": { email: true, sms: true, push: false },
            "blood-availability": { email: true, sms: false, push: false },
        },
    };

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                preferences,
                "Notification preferences fetched"
            )
        );
});

// Update notification preferences
const updatePreferences = asyncHandler(async (req, res) => {
    const { preferences } = req.body;

    // Validate preferences structure
    if (!preferences || typeof preferences !== "object") {
        throw new ApiError(400, "Invalid preferences format");
    }

    req.user.notificationPreferences = {
        ...req.user.notificationPreferences,
        ...preferences,
    };

    await req.user.save();

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                req.user.notificationPreferences,
                "Notification preferences updated"
            )
        );
});

// Get notification statistics
const getNotificationStats = asyncHandler(async (req, res) => {
    const stats = await Notification.aggregate([
        {
            $match: {
                recipient: req.user._id,
                createdAt: {
                    $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
                },
            },
        },
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 },
                types: { $addToSet: "$type" },
            },
        },
    ]);

    const unreadCount = await Notification.countDocuments({
        recipient: req.user._id,
        status: { $ne: NOTIFICATION_STATUS.READ },
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                stats,
                unreadCount,
            },
            "Notification statistics fetched"
        )
    );
});

// Delete notification
const deleteNotification = asyncHandler(async (req, res) => {
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        recipient: req.user._id,
    });

    if (!notification) {
        throw new ApiError(404, "Notification not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Notification deleted successfully"));
});

export {
    getNotifications,
    markAsRead,
    markAllAsRead,
    getPreferences,
    updatePreferences,
    getNotificationStats,
    deleteNotification,
};
