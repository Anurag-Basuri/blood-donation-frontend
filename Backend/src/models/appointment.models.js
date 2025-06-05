import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    centerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Center',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    timeSlot: {
        type: String,
        enum: ['Morning', 'Afternoon', 'Evening'],
        required: true
    },
    status: {
        type: String,
        enum: ['Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'Rescheduled', 'No Show'],
        default: 'Scheduled'
    },
    healthInformation: {
        hemoglobin: Number,
        bloodPressure: {
            systolic: Number,
            diastolic: Number
        },
        weight: Number,
        temperature: Number,
        recordedAt: Date
    },
    donationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BloodDonation'
    },
    cancellationReason: String,
    notes: String
}, {
    timestamps: true
});

// Indexes
appointmentSchema.index({ date: 1, status: 1 });
appointmentSchema.index({ centerId: 1, date: 1 });

export const DonationAppointment = mongoose.model('DonationAppointment', appointmentSchema);