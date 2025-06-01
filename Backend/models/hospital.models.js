import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const hospitalSchema = new mongoose.Schema({
  // Basic hospital information
  name: {
    type: String,
    required: [true, 'Hospital name is required'],
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
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationOTP: {
    code: String,
    expiresAt: Date
  },
  
  // Contact information
  contactPerson: {
    name: String,
    phone: String,
    position: String
  },
  emergencyContact: {
    name: String,
    phone: String,
    available24x7: Boolean
  },
  address: {
    street: String,
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
  
  // Hospital profile
  specialties: [{
    type: String,
    enum: ['Blood Bank', 'Trauma Center', 'General Hospital', 'Specialty Hospital', 'Clinic', 'Other']
  }],
  registrationNumber: {
    type: String,
    unique: true,
    sparse: true // Allows null values
  },
  
  // Blood requirements
  bloodRequirements: [{
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    unitsNeeded: {
      type: Number,
      min: 1
    },
    urgencyLevel: {
      type: String,
      enum: ['Emergency', 'Regular', 'Future Need'],
      default: 'Regular'
    }
  }],
  
  // Connected NGOs
  connectedNGOs: [{
    ngoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NGO'
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
  }]
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Add index for faster queries
hospitalSchema.index({ 'address.city': 1, 'address.pinCode': 1 });
hospitalSchema.index({ 'address.location': '2dsphere' });

// Define virtual for pending blood requests
hospitalSchema.virtual('pendingRequests', {
  ref: 'BloodRequest',
  localField: '_id',
  foreignField: 'hospitalId',
  match: { status: { $in: ['Pending', 'Processing'] } }
});

// Method to find nearby NGOs
hospitalSchema.methods.findNearbyNGOs = function(maxDistance = 10000) { // Default 10km
  return mongoose.model('NGO').find({
    'address.location': {
      $near: {
        $geometry: this.address.location,
        $maxDistance: maxDistance
      }
    }
  });
};

hospitalSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
hospitalSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Create the model
const Hospital = mongoose.model('Hospital', hospitalSchema);

export default Hospital;