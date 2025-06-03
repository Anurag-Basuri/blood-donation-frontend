import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const ngoSchema = new mongoose.Schema({
  // Basic NGO Information
  name: {
    type: String,
    required: [true, 'NGO name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long']
  },
  
  // Verification
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationOTP: {
    code: String,
    expiresAt: Date
  },
  
  // Contact Information
  contactPerson: {
    name: String,
    phone: String,
    position: String
  },
  address: {
    street: Object,
    city: {
      type: String,
      required: true
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
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere' // For geospatial queries
      }
    }
  },
  
  // NGO Profile
  regNumber: {
    type: String,
    unique: true,
    sparse: true // Allows null values
  },
  affiliation: {
    type: String,
    enum: ['Government', 'Private', 'Independent', 'Religious', 'Corporate', 'Other'],
    default: 'Independent'
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
      'Emergency Response',
      'Home Collection'
    ]
  }],
  
  // Blood Inventory Management
  bloodInventory: [{
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true
    },
    units: {
      type: Number,
      default: 0,
      min: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Connected Hospitals
  connectedHospitals: [{
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital'
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending'
    },
    connectedDate: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Statistics
  statistics: {
    totalCampsOrganized: {
      type: Number,
      default: 0
    },
    totalDonationsCollected: {
      type: Number,
      default: 0
    },
    totalHospitalsServed: {
      type: Number,
      default: 0
    },
    lastCampDate: Date
  },
  
  // Settings
  settings: {
    notificationsEnabled: {
      type: Boolean,
      default: true
    },
    autoAcceptRequests: {
      type: Boolean,
      default: false
    },
    minBloodLevelAlert: {
      type: Number,
      default: 5 // Alert when blood units drop below this level
    }
  }
}, {
  timestamps: true
});

// Add index for faster queries
ngoSchema.index({ 'address.city': 1, 'address.pinCode': 1 });
ngoSchema.index({ 'address.location': '2dsphere' });

// Define virtuals for blood camps
ngoSchema.virtual('upcomingCamps', {
  ref: 'DonationCamp',
  localField: '_id',
  foreignField: 'ngoId',
  match: { campDate: { $gte: new Date() } }
});

// Method to update blood inventory
ngoSchema.methods.updateBloodStock = async function(bloodGroup, units, operation = 'add') {
  let inventory = this.bloodInventory.find(item => item.bloodGroup === bloodGroup);
  
  if (!inventory) {
    inventory = {
      bloodGroup,
      units: 0,
      lastUpdated: new Date()
    };
    this.bloodInventory.push(inventory);
  }
  
  if (operation === 'add') {
    inventory.units += units;
  } else if (operation === 'subtract') {
    inventory.units = Math.max(0, inventory.units - units); // Prevent negative stock
  } else if (operation === 'set') {
    inventory.units = Math.max(0, units);
  }
  
  inventory.lastUpdated = new Date();
  return this.save();
};

// Method to find nearby hospitals
ngoSchema.methods.findNearbyHospitals = function(maxDistance = 10000) { // Default 10km
  return mongoose.model('Hospital').find({
    'address.location': {
      $near: {
        $geometry: this.address.location,
        $maxDistance: maxDistance
      }
    }
  });
};

ngoSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
ngoSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Create the model
const NGO = mongoose.model('NGO', ngoSchema);

export default NGO;