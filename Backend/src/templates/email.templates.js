import { formatDate } from '../utils/dateFormatter.js';

export const emailTemplates = {
    // Urgent Blood Request Template
    urgentRequest: (data) => {
        const { bloodType, hospital, location, urgencyLevel, contact } = data;
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Urgent Blood Request</title>
                <style>
                    .container { 
                        max-width: 600px; 
                        margin: 0 auto; 
                        padding: 20px;
                        font-family: Arial, sans-serif;
                    }
                    .urgent-header {
                        background-color: #ff4444;
                        color: white;
                        padding: 15px;
                        text-align: center;
                        border-radius: 5px;
                    }
                    .content {
                        padding: 20px;
                        background: #f9f9f9;
                        border-radius: 5px;
                        margin-top: 20px;
                    }
                    .cta-button {
                        background-color: #4CAF50;
                        color: white;
                        padding: 15px 30px;
                        text-decoration: none;
                        border-radius: 5px;
                        display: inline-block;
                        margin: 20px 0;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="urgent-header">
                        <h1>URGENT BLOOD NEEDED</h1>
                        <h2>${bloodType}</h2>
                    </div>
                    <div class="content">
                        <p>Your blood type matches an urgent requirement at ${hospital}.</p>
                        <p><strong>Location:</strong> ${location}</p>
                        <p><strong>Urgency Level:</strong> ${urgencyLevel}</p>
                        <p><strong>Contact:</strong> ${contact}</p>
                        <a href="${data.donationLink}" class="cta-button">Respond Now</a>
                        <p>Your donation can save a life!</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    },

    // Appointment Confirmation Template
    appointmentConfirmation: (data) => {
        const { date, center, donor, appointmentId } = data;
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Appointment Confirmation</title>
                <style>
                    .container { 
                        max-width: 600px; 
                        margin: 0 auto; 
                        padding: 20px;
                        font-family: Arial, sans-serif;
                    }
                    .header {
                        background-color: #4CAF50;
                        color: white;
                        padding: 15px;
                        text-align: center;
                        border-radius: 5px;
                    }
                    .details {
                        background: #f9f9f9;
                        padding: 20px;
                        border-radius: 5px;
                        margin-top: 20px;
                    }
                    .qr-code {
                        text-align: center;
                        margin: 20px 0;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Appointment Confirmed</h1>
                    </div>
                    <div class="details">
                        <h2>Dear ${donor.name},</h2>
                        <p>Your blood donation appointment has been confirmed.</p>
                        <p><strong>Date & Time:</strong> ${formatDate(date)}</p>
                        <p><strong>Center:</strong> ${center.name}</p>
                        <p><strong>Address:</strong> ${center.address}</p>
                        <p><strong>Appointment ID:</strong> ${appointmentId}</p>
                        <div class="qr-code">
                            <img src="${data.qrCode}" alt="Appointment QR Code">
                        </div>
                        <h3>Important Instructions:</h3>
                        <ul>
                            ${data.instructions.map(inst => `<li>${inst}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </body>
            </html>
        `;
    },

    // Donation Reminder Template
    donationReminder: (data) => {
        const { nextDonationDate, center, donor, lastDonation } = data;
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Donation Reminder</title>
                <style>
                    .container { 
                        max-width: 600px; 
                        margin: 0 auto; 
                        padding: 20px;
                        font-family: Arial, sans-serif;
                    }
                    .reminder-header {
                        background-color: #2196F3;
                        color: white;
                        padding: 15px;
                        text-align: center;
                        border-radius: 5px;
                    }
                    .schedule-button {
                        background-color: #4CAF50;
                        color: white;
                        padding: 15px 30px;
                        text-decoration: none;
                        border-radius: 5px;
                        display: inline-block;
                        margin: 20px 0;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="reminder-header">
                        <h1>Time to Donate Again!</h1>
                    </div>
                    <div class="content">
                        <h2>Hello ${donor.name},</h2>
                        <p>You are now eligible to donate blood again.</p>
                        <p><strong>Last Donation:</strong> ${formatDate(lastDonation)}</p>
                        <p><strong>Next Eligible Date:</strong> ${formatDate(nextDonationDate)}</p>
                        <p><strong>Nearest Center:</strong> ${center.name}</p>
                        <a href="${data.scheduleLink}" class="schedule-button">Schedule Now</a>
                    </div>
                </div>
            </body>
            </html>
        `;
    },

    // Blood Availability Update Template
    bloodAvailability: (data) => {
        const { bloodType, inventory, hospital } = data;
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Blood Availability Update</title>
                <style>
                    .container { 
                        max-width: 600px; 
                        margin: 0 auto; 
                        padding: 20px;
                        font-family: Arial, sans-serif;
                    }
                    .status-header {
                        background-color: #673AB7;
                        color: white;
                        padding: 15px;
                        text-align: center;
                        border-radius: 5px;
                    }
                    .inventory-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 20px 0;
                    }
                    .inventory-table th, .inventory-table td {
                        border: 1px solid #ddd;
                        padding: 8px;
                        text-align: center;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="status-header">
                        <h1>Blood Inventory Update</h1>
                        <h2>${hospital.name}</h2>
                    </div>
                    <div class="content">
                        <p>Current inventory status for blood type ${bloodType}:</p>
                        <table class="inventory-table">
                            <tr>
                                <th>Units Available</th>
                                <th>Status</th>
                                <th>Last Updated</th>
                            </tr>
                            <tr>
                                <td>${inventory.units}</td>
                                <td>${inventory.status}</td>
                                <td>${formatDate(inventory.lastUpdated)}</td>
                            </tr>
                        </table>
                    </div>
                </div>
            </body>
            </html>
        `;
    }
};