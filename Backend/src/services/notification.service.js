import { sendMail } from "./emailService.js";
import { sendSMS } from "./smsService.js";
import { ApiError } from "../utils/ApiError.js";
import Notification from "../models/notification.models.js";
import { emailTemplates } from "../templates/email.templates.js";

class NotificationService {
    async sendNotification(type, recipient, data) {
        try {
            // Create notification record
            const notification = await this.createNotificationRecord(
                type,
                recipient,
                data
            );

            // Handle notification
            await this.processNotification(type, recipient, data);

            // Update status
            await this.updateNotificationStatus(notification._id);

            return { success: true, notificationId: notification._id };
        } catch (error) {
            throw new ApiError(500, `Notification failed: ${error.message}`);
        }
    }

    // Notification Handlers
    async handleUrgentBloodRequest(recipient, data) {
        const { bloodType, hospital, urgency } = data;

        // Send urgent SMS
        await sendSMS({
            to: recipient.phone,
            body: `URGENT: ${bloodType} blood needed at ${hospital}. Your donation can save a life!`,
        });

        // Send detailed email
        await sendMail({
            to: recipient.email,
            subject: `Urgent Blood Request: ${bloodType} needed`,
            html: emailTemplates.urgentRequest(data),
        });
    }

    async handleDonationReminder(recipient, data) {
        const { nextDonationDate, center } = data;

        await sendMail({
            to: recipient.email,
            subject: "Time for Your Next Blood Donation",
            html: emailTemplates.donationReminder(data),
        });

        // Optional SMS reminder
        if (data.sendSMS) {
            await sendSMS({
                to: recipient.phone,
                body: `Reminder: You're eligible to donate blood on ${nextDonationDate} at ${center}`,
            });
        }
    }

    async handleAppointmentConfirmation(recipient, data) {
        const { date, center, donationType } = data;

        // Send confirmation email
        await sendMail({
            to: recipient.email,
            subject: "Blood Donation Appointment Confirmation",
            html: emailTemplates.appointmentConfirmation(data),
        });

        // Send SMS confirmation
        await sendSMS({
            to: recipient.phone,
            body: `Your blood donation appointment is confirmed for ${date} at ${center}`,
        });
    }

    async handleBloodAvailability(recipient, data) {
        const { bloodType, quantity, hospital } = data;

        await sendMail({
            to: recipient.email,
            subject: `Blood Availability Update: ${bloodType}`,
            html: emailTemplates.bloodAvailability(data),
        });
    }

    // Helper Methods
    async createNotificationRecord(type, recipient, data) {
        return await Notification.create({
            type,
            recipient: recipient._id,
            data,
            status: "pending",
        });
    }

    async processNotification(type, recipient, data) {
        const handlers = {
            "urgent-blood-request": this.handleUrgentBloodRequest,
            "donation-reminder": this.handleDonationReminder,
            "appointment-confirmation": this.handleAppointmentConfirmation,
            "blood-availability": this.handleBloodAvailability,
        };

        const handler = handlers[type];
        if (!handler) {
            throw new ApiError(400, "Invalid notification type");
        }

        await handler.call(this, recipient, data);
    }

    async updateNotificationStatus(notificationId) {
        await Notification.findByIdAndUpdate(notificationId, {
            status: "sent",
            sentAt: new Date(),
        });
    }
}

export default new NotificationService();
