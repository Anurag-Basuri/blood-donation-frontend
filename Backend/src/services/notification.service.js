import { sendMail } from "./email.service.js";
import { sendSMS } from "./sms.service.js";
import { ApiError } from "../utils/ApiError.js";
import { Notification } from "../models/others/notification.model.js";
import { emailTemplates } from "../templates/email.templates.js";

class NotificationService {
    constructor() {
        this.handlers = {
            "urgent-blood-request": this.handleUrgentBloodRequest,
            "donation-reminder": this.handleDonationReminder,
            "appointment-confirmation": this.handleAppointmentConfirmation,
            "blood-availability": this.handleBloodAvailability,
        };
    }

    /**
     * Send notification (email/SMS) based on type
     * @param {string} type - Notification type
     * @param {object} recipient - User object with email/phone
     * @param {object} data - Payload for notification
     */
    async sendNotification(type, recipient, data) {
        try {
            const notification = await this.createNotificationRecord(type, recipient, data);

            await this.processNotification(type, recipient, data);

            await this.markNotificationSent(notification._id);

            return { success: true, notificationId: notification._id };
        } catch (error) {
            console.error(`Notification [${type}] error:`, error);
            throw new ApiError(500, `Notification failed: ${error.message}`);
        }
    }

    /**
     * Central processor for notification based on type
     */
    async processNotification(type, recipient, data) {
        const handler = this.handlers[type];
        if (!handler) {
            throw new ApiError(400, `Unsupported notification type: ${type}`);
        }

        await handler.call(this, recipient, data);
    }

    // ---------------------
    //   Notification Types
    // ---------------------

    async handleUrgentBloodRequest(recipient, data) {
        const { bloodType, hospital } = data;

        await Promise.all([
            sendSMS({
                to: recipient.phone,
                body: `URGENT: ${bloodType} blood needed at ${hospital}. Your donation can save a life!`,
            }),
            sendMail({
                to: recipient.email,
                subject: `Urgent Blood Request: ${bloodType} Needed`,
                html: emailTemplates.urgentRequest(data),
            }),
        ]);
    }

    async handleDonationReminder(recipient, data) {
        const { nextDonationDate, center, sendSMS: shouldSendSMS } = data;

        const tasks = [
            sendMail({
                to: recipient.email,
                subject: "Time for Your Next Blood Donation",
                html: emailTemplates.donationReminder(data),
            }),
        ];

        if (shouldSendSMS) {
            tasks.push(
                sendSMS({
                    to: recipient.phone,
                    body: `Reminder: You're eligible to donate blood on ${nextDonationDate} at ${center}.`,
                })
            );
        }

        await Promise.all(tasks);
    }

    async handleAppointmentConfirmation(recipient, data) {
        const { date, center } = data;

        await Promise.all([
            sendMail({
                to: recipient.email,
                subject: "Blood Donation Appointment Confirmation",
                html: emailTemplates.appointmentConfirmation(data),
            }),
            sendSMS({
                to: recipient.phone,
                body: `Appointment confirmed for ${date} at ${center}.`,
            }),
        ]);
    }

    async handleBloodAvailability(recipient, data) {
        const { bloodType } = data;

        await sendMail({
            to: recipient.email,
            subject: `Blood Availability Update: ${bloodType}`,
            html: emailTemplates.bloodAvailability(data),
        });
    }

    // ---------------------
    //       Helpers
    // ---------------------

    async createNotificationRecord(type, recipient, data) {
        return await Notification.create({
            type,
            recipient: recipient._id,
            data,
            status: "pending",
        });
    }

    async markNotificationSent(notificationId) {
        await Notification.findByIdAndUpdate(notificationId, {
            status: "sent",
            sentAt: new Date(),
        });
    }
}

export default new NotificationService();
