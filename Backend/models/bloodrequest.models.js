// You can create this in bloodRequest.models.js
import mongoose from 'mongoose';

const bloodRequestSchema = new mongoose.Schema({
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ngo',
    required: true
  },
  bloodGroups: [{
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true
    },
    units: {
      type: Number,
      required: true,
      min: 1
    }
  }],
  urgencyLevel: {
    type: String,
    enum: ['Emergency', 'Regular', 'Future Need'],
    default: 'Regular'
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected', 'Processing', 'En Route', 'Delivered', 'Completed'],
    default: 'Pending'
  },
  requestNotes: String,
  deliveryDetails: {
    estimatedDeliveryTime: Date,
    actualDeliveryTime: Date,
    deliveredBy: String,
    receivedBy: String,
    confirmationCode: String
  },
  documents: [{
    name: String,
    fileUrl: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

const BloodRequest = mongoose.model('BloodRequest', bloodRequestSchema);

export default BloodRequest;