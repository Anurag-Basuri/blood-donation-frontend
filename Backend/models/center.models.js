import mongoose from 'mongoose';

const centerSchema = new mongoose.Schema({
  // Basic center information
  name: {
    type: String,
    required: [true, 'Center name is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['DonationCamp', 'BloodBank'],
    required: [true, 'Center type is required']
  },
  description: String,
  
  // Ownership information - NGO that created/manages the center
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NGO', // Updated to match NGO model name
    required: true
  },
  
  // Contact information
  contactPerson: {
    name: String,
    phone: String,
    email: String
  },
  
  // Location details
  location: {
    address: String,
    city: {
      type: String,
      required: true,
      index: true
    },
    state: String,
    pinCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      default: 'India'
    },
    // For geospatial queries
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere'
      }
    }
  },
  
  // Timing information - differs between camp and blood bank
  timing: {
    // For donation camps (temporary)
    startDate: Date,
    endDate: Date,
    operationalHours: [{
      day: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'All']
      },
      openTime: String, // Format: "09:00"
      closeTime: String, // Format: "18:00"
    }],
    
    // For blood banks (permanent)
    establishedDate: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  },
  
  // Facilities provided
  facilities: [{
    type: String,
    enum: [
      'Free Health Checkup', 
      'Refreshments', 
      'Donation Certificates', 
      'Transport',
      'Blood Testing',
      'Blood Storage',
      'Counseling',
      'Home Collection'
    ]
  }],
  
  // Target blood groups
  targetBloodGroups: [{
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'All']
  }],
  
  // For blood banks: current inventory - synchronized with BloodDonation model
  bloodInventory: [{
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    units: {
      type: Number,
      default: 0
    },
    availableUnits: {
      type: Number,
      default: 0 // Units that are available for use (status: 'available')
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Staff and volunteers
  staff: [{
    name: String,
    role: String,
    phone: String,
    email: String,
    isVolunteer: {
      type: Boolean,
      default: false
    }
  }],
  
  // Registration slots for donation camps
  slots: [{
    date: Date,
    startTime: String,
    endTime: String,
    capacity: {
      type: Number,
      default: 10
    },
    booked: {
      type: Number,
      default: 0
    }
  }],
  
  // Statistics
  statistics: {
    totalDonations: {
      type: Number,
      default: 0
    },
    totalDonors: {
      type: Number,
      default: 0
    },
    lastDonationDate: Date
  },
  
  // Media
  media: {
    images: [String], // URLs to center images
    videos: [String],  // URLs to videos
    documents: [{
      name: String,
      url: String,
      type: String
    }]
  },
  
  // Status
  status: {
    type: String,
    enum: ['Planning', 'Active', 'Completed', 'Cancelled', 'Suspended'],
    default: 'Planning'
  }
}, {
  timestamps: true,
  
  // Add discriminator key to differentiate between donation camps and blood banks
  discriminatorKey: 'centerType',
  
  // Add virtuals to document JSON output
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals to connect with BloodDonation model
centerSchema.virtual('bloodDonations', {
  ref: 'BloodDonation',
  localField: '_id',
  foreignField: 'centerId'
});

centerSchema.virtual('availableBlood', {
  ref: 'BloodDonation',
  localField: '_id',
  foreignField: 'centerId',
  match: { 
    status: 'available',
    expiryDate: { $gt: new Date() }
  }
});

// Add indexes for faster queries
centerSchema.index({ 'location.city': 1, 'location.pinCode': 1 });
centerSchema.index({ 'location.coordinates': '2dsphere' });
centerSchema.index({ type: 1, status: 1 });
centerSchema.index({ ngoId: 1 });

// Methods to interact with blood inventory
centerSchema.methods.updateBloodInventory = async function() {
  // Import BloodDonation model dynamically to avoid circular dependencies
  const BloodDonation = mongoose.model('BloodDonation');
  
  // Get current blood inventory from BloodDonation model
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  
  // For each blood group, count total and available donations
  for (const bloodGroup of bloodGroups) {
    // Count all donations of this blood group at this center
    const totalCount = await BloodDonation.countDocuments({
      centerId: this._id,
      bloodGroup,
      currentLocation: { entityId: this._id }
    });
    
    // Count available donations of this blood group at this center
    const availableCount = await BloodDonation.countDocuments({
      centerId: this._id,
      bloodGroup,
      status: 'available',
      expiryDate: { $gt: new Date() },
      currentLocation: { entityId: this._id }
    });
    
    // Update or create inventory record
    let inventory = this.bloodInventory.find(item => item.bloodGroup === bloodGroup);
    
    if (!inventory) {
      inventory = {
        bloodGroup,
        units: totalCount,
        availableUnits: availableCount,
        lastUpdated: new Date()
      };
      this.bloodInventory.push(inventory);
    } else {
      inventory.units = totalCount;
      inventory.availableUnits = availableCount;
      inventory.lastUpdated = new Date();
    }
  }
  
  return this.save();
};

// Method to register a blood donation
centerSchema.methods.registerBloodDonation = async function(donationData) {
  // Import BloodDonation model dynamically to avoid circular dependencies
  const BloodDonation = mongoose.model('BloodDonation');
  
  // Create a new blood donation record
  const bloodDonation = new BloodDonation({
    ...donationData,
    centerId: this._id,
    centerType: this.type
  });
  
  // Save the blood donation record
  await bloodDonation.save();
  
  // Update the blood inventory
  await this.updateBloodInventory();
};

// Create the base model
const Center = mongoose.model('Center', centerSchema);

// Create discriminators for specific center types
const DonationCamp = Center.discriminator('DonationCamp', new mongoose.Schema({
  campaignName: {
    type: String,
    required: true
  },
  targetDonations: {
    type: Number,
    required: true
  },
  eventPartners: {
    type: [{
      name: {
        type: String,
        required: true
      },
      type: {
        type: String,
        required: true,
        enum: ['Healthcare', 'Corporate', 'Educational', 'Government', 'NGO', 'Other']
      },
      contributionType: {
        type: String,
        required: true
      }
    }],
    default: []
  },
  registrationDeadline: {
    type: Date,
    required: true
  }
}));

const BloodBank = Center.discriminator('BloodBank', new mongoose.Schema({
  licenseNumber: {
    type: String,
    unique: true
  },
  licenseExpiry: Date,
  storageCapacity: {
    type: Number, // Units of blood that can be stored
    required: true
  },
  certifications: [{
    name: String,
    issuedBy: String,
    validUntil: Date
  }],
  equipments: [{
    name: String,
    count: Number,
    lastMaintenance: Date
  }]
}));

export { Center, DonationCamp, BloodBank };