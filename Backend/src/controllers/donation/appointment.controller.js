import { DonationAppointment } from "../../models/donation/appointment.models.js";
import { Center } from "../../models/donation/center.models.js";
import { Activity } from "../../models/others/activity.model.js";
import { notificationService } from "../../services/notification.service.js";
import { aiService } from "../../services/ai.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

// Appointment status enums
const APPOINTMENT_STATUS = {
    SCHEDULED: "SCHEDULED",
    CONFIRMED: "CONFIRMED",
    COMPLETED: "COMPLETED",
    CANCELLED: "CANCELLED",
    RESCHEDULED: "RESCHEDULED",
    NO_SHOW: "NO_SHOW",
};

const createAppointment = asyncHandler(async (req, res) => {
    const { centerId, date, slotTime, bloodGroup, donationType } = req.body;
    const userId = req.user._id;

    // Enhanced validation
    if (!date || new Date(date) < new Date()) {
        throw new ApiError(400, "Invalid appointment date");
    }

    // Check center availability and validation
    const center = await Center.findById(centerId);
    if (!center) {
        throw new ApiError(404, "Donation center not found");
    }

    // Check if slot is available
    const isSlotAvailable = await center.checkSlotAvailability(date, slotTime);
    if (!isSlotAvailable) {
        throw new ApiError(400, "Selected time slot is not available");
    }

    // Validate donor eligibility
    const isEligible = await req.user.isEligibleToDonate();
    if (!isEligible.status) {
        throw new ApiError(400, `Not eligible to donate: ${isEligible.reason}`);
    }

    // Create appointment with enhanced details
    const appointment = await DonationAppointment.create({
        userId,
        centerId,
        date,
        slotTime,
        bloodGroup,
        donationType,
        status: APPOINTMENT_STATUS.SCHEDULED,
        donorDetails: {
            previousDonations: req.user.donations?.length || 0,
            healthInfo: req.user.healthInfo,
            specialNotes: req.user.medicalConditions,
        },
    });

    // Update center slot
    await center.reserveSlot(date, slotTime);

    // Send notifications with enhanced information
    await Promise.all([
        notificationService.sendNotification(
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
                    requirements: await center.getDonationRequirements(
                        donationType
                    ),
                    directions: await center.getDirections(
                        req.user.address?.location
                    ),
                },
            }
        ),
        Activity.create({
            type: "APPOINTMENT_CREATED",
            performedBy: { userId, userModel: "User" },
            details: {
                appointmentId: appointment._id,
                center: center.name,
                date,
                donationType,
            },
        }),
    ]);

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                { appointment },
                "Appointment scheduled successfully"
            )
        );
});

const updateAppointment = asyncHandler(async (req, res) => {
    const { appointmentId } = req.params;
    const { status, reason, newDate, newSlotTime } = req.body;

    const appointment = await DonationAppointment.findById(appointmentId)
        .populate("centerId")
        .populate("userId", "email phone");

    if (!appointment) {
        throw new ApiError(404, "Appointment not found");
    }

    // Handle rescheduling
    if (newDate && newSlotTime) {
        const isNewSlotAvailable =
            await appointment.centerId.checkSlotAvailability(
                newDate,
                newSlotTime
            );

        if (!isNewSlotAvailable) {
            throw new ApiError(400, "New time slot is not available");
        }

        // Release old slot and reserve new one
        await Promise.all([
            appointment.centerId.releaseSlot(
                appointment.date,
                appointment.slotTime
            ),
            appointment.centerId.reserveSlot(newDate, newSlotTime),
        ]);

        appointment.date = newDate;
        appointment.slotTime = newSlotTime;
        appointment.status = APPOINTMENT_STATUS.RESCHEDULED;
    } else if (status) {
        appointment.status = status;
        appointment.statusReason = reason;

        // Release slot if cancelled
        if (status === APPOINTMENT_STATUS.CANCELLED) {
            await appointment.centerId.releaseSlot(
                appointment.date,
                appointment.slotTime
            );
        }
    }

    await appointment.save();

    // Send notifications based on update type
    const notificationType =
        status === APPOINTMENT_STATUS.CANCELLED
            ? "appointment-cancelled"
            : newDate
            ? "appointment-rescheduled"
            : "appointment-update";

    await notificationService.sendNotification(
        notificationType,
        appointment.userId,
        {
            date: appointment.date,
            center: appointment.centerId.name,
            status: appointment.status,
            reason,
            sendSMS: true,
            metadata: {
                appointmentId: appointment._id,
                newDate,
                newSlotTime,
            },
        }
    );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { appointment },
                "Appointment updated successfully"
            )
        );
});

const sendReminder = asyncHandler(async (req, res) => {
    const { appointmentId } = req.params;

    const appointment = await DonationAppointment.findById(appointmentId)
        .populate("centerId", "name address donationInstructions requirements")
        .populate("userId", "email phone address");

    if (!appointment) {
        throw new ApiError(404, "Appointment not found");
    }

    // Get traffic and weather information
    const [trafficInfo, weatherInfo] = await Promise.all([
        aiService.getTrafficEstimate(
            appointment.userId.address?.location,
            appointment.centerId.address.location,
            appointment.date
        ),
        aiService.getWeatherForecast(
            appointment.centerId.address.location,
            appointment.date
        ),
    ]);

    // Send comprehensive reminder
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
                requirements: appointment.centerId.requirements,
                trafficInfo,
                weatherInfo,
                directions: await appointment.centerId.getDirections(
                    appointment.userId.address?.location
                ),
            },
        }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Reminder sent successfully"));
});

export {
    createAppointment,
    updateAppointment,
    sendReminder,
    APPOINTMENT_STATUS,
};
