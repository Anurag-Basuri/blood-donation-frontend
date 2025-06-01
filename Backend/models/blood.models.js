import mongoose from 'mongoose';

const bloodDonationSchema = new mongoose.Schema({
  // Reference to user who donated
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Reference to the NGO that collected the blood
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NGO',
    required: true
  },
  // Reference to the center where blood was collected
  centerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Center',
    required: true
  },
  // Center type (DonationCamp or BloodBank)
  centerType: {
    type: String,
    enum: ['DonationCamp', 'BloodBank'],
    required: true
  },
  // Blood group with validation
  bloodGroup: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    index: true // Add index for faster queries by blood group
  },
  // Amount of blood donated (in ml)
  donationAmount: {
    type: Number,
    required: true,
    min: 100, // Minimum donation amount
    default: 450 // Standard donation amount
  },
  // Donation date
  donationDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  // Location of donation
  donationCenter: {
    type: String,
    required: true
  },
  // Health metrics at time of donation
  healthMetrics: {
    hemoglobin: Number,
    bloodPressure: String,
    pulse: Number,
    temperature: Number
  },
  // Status of donation (processing, available, used)
  status: { 
    type: String,
    enum: ['processing', 'available', 'assigned', 'used', 'expired', 'discarded'],
    default: 'processing'
  },
  // Expiration date (calculated based on donation date)
  expiryDate: {
    type: Date
  },
  // Track transfers between centers/hospitals
  transferHistory: [{
    fromId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'transferHistory.fromType'
    },
    fromType: {
      type: String,
      enum: ['NGO', 'Center', 'Hospital']
    },
    toId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'transferHistory.toType'
    },
    toType: {
      type: String,
      enum: ['NGO', 'Center', 'Hospital']
    },
    transferDate: {
      type: Date,
      default: Date.now
    },
    reason: String
  }],
  // Current location of the blood unit
  currentLocation: {
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'currentLocation.entityType'
    },
    entityType: {
      type: String,
      enum: ['NGO', 'Center', 'Hospital'],
      default: 'Center'
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  // Additional notes
  notes: String,
  // For admin tracking and auditing
  adminNotes: String,
  lastVerifiedBy: {
    adminId: mongoose.Schema.Types.ObjectId,
    date: Date
  }
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps
});

// Add composite indexes for faster queries
bloodDonationSchema.index({ ngoId: 1, status: 1 });
bloodDonationSchema.index({ centerId: 1, bloodGroup: 1 });
bloodDonationSchema.index({ status: 1, expiryDate: 1 });
bloodDonationSchema.index({ 'currentLocation.entityId': 1, 'currentLocation.entityType': 1 });

// Pre-save hook to calculate expiry date (typically 42 days for whole blood)
bloodDonationSchema.pre('save', function(next) {
  if (!this.expiryDate && this.donationDate) {
    // Set expiry to 42 days after donation
    this.expiryDate = new Date(this.donationDate);
    this.expiryDate.setDate(this.expiryDate.getDate() + 42);
  }
  
  // Initialize current location if not set
  if (!this.currentLocation.entityId) {
    this.currentLocation.entityId = this.centerId;
    this.currentLocation.entityType = 'Center';
    this.currentLocation.updatedAt = new Date();
  }
  
  next();
});

// Method to check if blood donation is still valid
bloodDonationSchema.methods.isValid = function() {
  return this.status === 'available' && new Date() < this.expiryDate;
};

// Method to transfer blood to a different entity (NGO, Center, Hospital)
bloodDonationSchema.methods.transferTo = async function(toEntityId, toEntityType, reason) {
  // Add to transfer history
  this.transferHistory.push({
    fromId: this.currentLocation.entityId,
    fromType: this.currentLocation.entityType,
    toId: toEntityId,
    toType: toEntityType,
    transferDate: new Date(),
    reason: reason || 'Transfer requested'
  });
  
  // Update current location
  this.currentLocation = {
    entityId: toEntityId,
    entityType: toEntityType,
    updatedAt: new Date()
  };
  
  return this.save();
};

// Static method to find available donations by blood group
bloodDonationSchema.statics.findAvailableByBloodGroup = function(bloodGroup, options = {}) {
  const query = {
    bloodGroup,
    status: 'available',
    expiryDate: { $gt: new Date() }
  };
  
  // Add optional filters if provided
  if (options.ngoId) query.ngoId = options.ngoId;
  if (options.centerId) query.centerId = options.centerId;
  
  return this.find(query)
    .sort({ expiryDate: 1 }) // Sort by expiry date (oldest first)
    .populate('ngoId', 'name') // Populate NGO name
    .populate('centerId', 'name location.city'); // Populate center details
};

// Admin methods for blood management
bloodDonationSchema.statics.findForAdmin = function(filters = {}, page = 1, limit = 50) {
  const query = {};
  
  // Apply optional filters
  if (filters.bloodGroup) query.bloodGroup = filters.bloodGroup;
  if (filters.status) query.status = filters.status;
  if (filters.ngoId) query.ngoId = filters.ngoId;
  if (filters.centerId) query.centerId = filters.centerId;
  if (filters.expiringBefore) {
    query.expiryDate = { $lt: new Date(filters.expiringBefore) };
  }
  
  const skip = (page - 1) * limit;
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('userId', 'name email')
    .populate('ngoId', 'name')
    .populate('centerId', 'name type')
    .populate('currentLocation.entityId', 'name');
};

// Method to verify and update the status of blood units
bloodDonationSchema.statics.verifyAndUpdateStatus = async function(bloodId, adminId, status, notes) {
  return this.findByIdAndUpdate(
    bloodId,
    {
      status,
      adminNotes: notes,
      lastVerifiedBy: {
        adminId,
        date: new Date()
      }
    },
    { new: true }
  );
};

const BloodDonation = mongoose.model('BloodDonation', bloodDonationSchema);

export default BloodDonation;