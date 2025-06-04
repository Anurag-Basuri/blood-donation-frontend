import nodemailer from "nodemailer";
import twilio from "twilio";
import { ApiError } from "../utils/ApiError.js";
import Notification from "../models/notification.models.js";

class NotificationService {
    constructor() {
        // Email configuration
        this.emailTransporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // SMS configuration
        this.twilioClient = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );
    }

    async sendNotification(type, recipient, data) {
        try {
            const notification = await Notification.create({
                type,
                recipient: recipient._id,
                data,
                status: "pending",
            });

            const notificationHandlers = {
                "urgent-blood-request": this.handleUrgentBloodRequest,
                "donation-reminder": this.handleDonationReminder,
                "appointment-confirmation": this.handleAppointmentConfirmation,
                "blood-availability": this.handleBloodAvailability,
            };

            const handler = notificationHandlers[type];
            if (!handler) {
                throw new ApiError(400, "Invalid notification type");
            }

            await handler.call(this, recipient, data);
            await Notification.findByIdAndUpdate(notification._id, {
                status: "sent",
            });

            return { success: true, notificationId: notification._id };
        } catch (error) {
            throw new ApiError(500, `Notification failed: ${error.message}`);
        }
    }

    async handleUrgentBloodRequest(recipient, data) {
        const { bloodType, hospital, urgency } = data;

        // Send SMS for urgent requests
        await this.sendSMS(
            recipient.phone,
            `URGENT: ${bloodType} blood needed at ${hospital}. Your donation can save a life!`
        );

        // Follow up with email
        await this.sendEmail({
            to: recipient.email,
            subject: `Urgent Blood Request: ${bloodType} needed`,
            html: this.getUrgentRequestTemplate(data),
        });
    }

    async handleDonationReminder(recipient, data) {
        const { nextDonationDate, center } = data;

        await this.sendEmail({
            to: recipient.email,
            subject: "Time for Your Next Blood Donation",
            html: this.getDonationReminderTemplate(data),
        });
    }

    async handleAppointmentConfirmation(recipient, data) {
        const { date, center, donationType } = data;

        await this.sendEmail({
            to: recipient.email,
            subject: "Blood Donation Appointment Confirmation",
            html: this.getAppointmentTemplate(data),
        });

        // Send SMS reminder
        await this.sendSMS(
            recipient.phone,
            `Your blood donation appointment is confirmed for ${date} at ${center}`
        );
    }

    async handleBloodAvailability(recipient, data) {
        const { bloodType, quantity, hospital } = data;

        await this.sendEmail({
            to: recipient.email,
            subject: `Blood Availability Update: ${bloodType}`,
            html: this.getBloodAvailabilityTemplate(data),
        });
    }

    // Helper methods
    async sendEmail({ to, subject, html }) {
        try {
            await this.emailTransporter.sendMail({
                from: process.env.EMAIL_USER,
                to,
                subject,
                html,
            });
        } catch (error) {
            throw new ApiError(500, `Email sending failed: ${error.message}`);
        }
    }

    async sendSMS(to, message) {
        try {
            await this.twilioClient.messages.create({
                body: message,
                to,
                from: process.env.TWILIO_PHONE_NUMBER,
            });
        } catch (error) {
            throw new ApiError(500, `SMS sending failed: ${error.message}`);
        }
    }

    // Template methods
    getUrgentRequestTemplate(data) {
        return `
            <h2>Urgent Blood Request</h2>
            <p>Blood Type: ${data.bloodType}</p>
            <p>Hospital: ${data.hospital}</p>
            <p>Urgency: ${data.urgency}</p>
            <a href="${data.donationLink}">Click here to help</a>
        `;
    }

    getDonationReminderTemplate(data) {
        // Template implementation
        return `...`;
    }

    getAppointmentTemplate(data) {
        // Template implementation
        return `...`;
    }

    getBloodAvailabilityTemplate(data) {
        // Template implementation
        return `...`;
    }
}

export default new NotificationService();
