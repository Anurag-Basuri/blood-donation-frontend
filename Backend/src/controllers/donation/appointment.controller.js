import { DonationAppointment } from "../../models/donation/appointment.models.js";
import { Center } from "../../models/donation/center.models.js";
import { Activity } from "../../models/others/activity.model.js";
import notificationService from "../../services/notification.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

const createAppointment = asyncHandler(async (req, res) => {
    const { centerId, date, slotTime, bloodGroup, donationType } = req.body;
    const userId = req.user._id;

    // Validate center and slot availability
    const center = await Center.findById(centerId);
    if (!center) {
        throw new ApiError(404, "Donation center not found");
    }

    // Create appointment
    const appointment = await DonationAppointment.create({
        userId,
        centerId,
        date,
        slotTime,
        bloodGroup,
        donationType,
        status: "SCHEDULED",
    });

    // Send confirmation notifications
    await notificationService.sendNotification(
        "appointment-confirmation",
        req.user,
        {
            date: appointment.date,
            center: center.name,
            donationType,
            sendSMS: true,
            metadata: {
                appointmentId: appointment._id,
                centerAddress: center.address,
                instructions: center.donationInstructions,
            },
        }
    );

    // Log activity
    await Activity.create({
        type: "APPOINTMENT_CREATED",
        performedBy: {
            userId,
            userModel: "User",
        },
        details: {
            appointmentId: appointment._id,
            center: center.name,
            date,
        },
    });

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                appointment,
                "Appointment scheduled successfully"
            )
        );
});

const updateAppointment = asyncHandler(async (req, res) => {
    const { appointmentId } = req.params;
    const { status, reason } = req.body;

    const appointment = await DonationAppointment.findById(appointmentId);
    if (!appointment) {
        throw new ApiError(404, "Appointment not found");
    }

    appointment.status = status;
    if (reason) appointment.statusReason = reason;
    await appointment.save();

    // Send status update notification
    const center = await Center.findById(appointment.centerId);
    await notificationService.sendNotification(
        status === "CANCELLED" ? "appointment-cancelled" : "appointment-update",
        req.user,
        {
            date: appointment.date,
            center: center.name,
            status,
            reason,
            sendSMS: true,
        }
    );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                appointment,
                "Appointment updated successfully"
            )
        );
});

const sendReminder = asyncHandler(async (req, res) => {
    const { appointmentId } = req.params;

    const appointment = await DonationAppointment.findById(appointmentId)
        .populate("centerId", "name address donationInstructions")
        .populate("userId", "email phone");

    if (!appointment) {
        throw new ApiError(404, "Appointment not found");
    }

    // Send reminder notification
    await notificationService.sendNotification(
        "donation-reminder",
        appointment.userId,
        {
            nextDonationDate: appointment.date,
            center: appointment.centerId.name,
            sendSMS: true,
            metadata: {
                appointmentId: appointment._id,
                instructions: appointment.centerId.donationInstructions,
                requirements: "Please bring valid ID and avoid heavy meals",
            },
        }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Reminder sent successfully"));
});

export { createAppointment, updateAppointment, sendReminder };
