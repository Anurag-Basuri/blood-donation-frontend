import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from 'bcryptjs';
import { ApiError } from "../../utils/ApiError.js";

// Constants
const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const MEDICAL_CONDITIONS = [
    "Infectious Diseases (HIV, Hepatitis B/C, Syphilis, Malaria, Tuberculosis)",
    "Chronic Illnesses (Diabetes, Hypertension, Heart/Kidney/Liver Disease)",
    "Blood Disorders (Anemia, Hemophilia, Clotting Disorders)",
    "Cancer (Leukemia, Lymphoma, Other Cancers)",
    "Autoimmune Diseases (Lupus, Rheumatoid Arthritis)",
    "Neurological Conditions (Epilepsy, Recent Stroke)",
    "Recent Surgery or Transplant",
    "Recent Infection (COVID-19, Sepsis, etc.)",
    "Pregnancy or Recent Childbirth",
    "None"
];

const userSchema = new Schema(
    {
        userName: {
            type: String,
            required: [true, "Username is required"],
            unique: true,
            trim: true,
            minlength: [3, "Username must be at least 3 characters"],
            maxlength: [20, "Username must be at most 20 characters"],
        },
        fullName: {
            type: String,
            required: [true, "Full name is required"],
            trim: true,
            minlength: [3, "Name must be at least 3 characters"],
            maxlength: [50, "Name must be at most 50 characters"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            validate: {
                validator: function (email) {
                    return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/.test(
                        email
                    );
                },
                message: "Please enter a valid email",
            },
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [8, "Password must be at least 8 characters"],
            validate: {
                validator: function (password) {
                    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
                        password
                    );
                },
                message:
                    "Password must contain uppercase, lowercase, number and special character",
            },
            select: false,
        },

        // Authentication & Security
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        emailVerificationOTP: {
            code: String,
            expiresAt: Date,
        },
        emailVerificationOTPExpiry: {
            type: Date,
            default: () => new Date(Date.now() + 10 * 60 * 1000),
        },
        isPhoneVerified: {
            type: Boolean,
            default: false,
        },
        phoneVerificationOTP: {
            code: String,
            expiresAt: Date,
        },
        phoneVerificationOTPExpiry: {
            type: Date,
            default: () => new Date(Date.now() + 10 * 60 * 1000),
        },
        refreshToken: {
            type: String,
            select: false,
        },
        loginAttempts: {
            type: Number,
            default: 0,
        },
        lastLogin: Date,

        // Personal Information
        dateOfBirth: {
            type: Date,
            required: [true, "Date of birth is required"],
            validate: {
                validator: function (date) {
                    return (
                        date <= new Date() &&
                        date >=
                            new Date(
                                new Date().setFullYear(
                                    new Date().getFullYear() - 65
                                )
                            )
                    );
                },
                message: "Age must be between 18 and 65 years",
            },
        },
        gender: {
            type: String,
            enum: ["Male", "Female"],
            required: true,
        },
        phone: {
            type: String,
            required: true,
            validate: {
                validator: function (v) {
                    return /^\+?[\d\s-]{10,}$/.test(v);
                },
                message: "Invalid phone number format",
            },
        },

        // Blood Donation Related
        bloodType: {
            type: String,
            enum: BLOOD_TYPES,
            required: false,
        },
        lastDonationDate: Date,
        nextEligibleDate: Date,
        totalDonations: {
            type: Number,
            default: 0,
        },
        donorStatus: {
            type: String,
            enum: [
                "Active",
                "Temporary Deferral",
                "Permanent Deferral",
                "First Time",
            ],
            default: "First Time",
        },
        medicalHistory: {
            conditions: [
                {
                    type: String,
                    enum: MEDICAL_CONDITIONS,
                },
            ],
            medications: [String],
            allergies: [String],
            lastCheckup: Date,
            weight: Number,
            hemoglobinLevel: Number,
            bloodPressure: {
                systolic: Number,
                diastolic: Number,
            },
        },
        donationPreferences: {
            preferredCenter: {
                type: Schema.Types.ObjectId,
                ref: "Center",
            },
            preferredDays: [
                {
                    type: String,
                    enum: [
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday",
                        "Saturday",
                        "Sunday",
                    ],
                },
            ],
            preferredTimeSlot: {
                type: String,
                enum: ["Morning", "Afternoon", "Evening"],
            }
        },
        bloodDonationHistory: [
            {
                donationId: {
                    type: Schema.Types.ObjectId,
                    ref: "BloodDonation",
                },
                date: Date,
                center: {
                    type: Schema.Types.ObjectId,
                    ref: "Center",
                },
                units: Number,
                certificate: String,
                healthMetrics: {
                    hemoglobin: Number,
                    bloodPressure: {
                        systolic: Number,
                        diastolic: Number,
                    },
                    weight: Number,
                },
            },
        ],

        // Location
        address: {
            street: String,
            city: {
                type: String,
                required: true,
            },
            state: String,
            pinCode: {
                type: String,
                required: true,
                validate: {
                    validator: function (v) {
                        return /^\d{6}$/.test(v);
                    },
                    message: "Invalid PIN code",
                },
            },
            country: {
                type: String,
                default: "India",
            },
            location: {
                type: {
                    type: String,
                    enum: ["Point"],
                    default: "Point",
                },
                coordinates: {
                    type: [Number],
                    required: true,
                    validate: {
                        validator: function (coords) {
                            return (
                                coords.length === 2 &&
                                coords[0] >= -180 &&
                                coords[0] <= 180 &&
                                coords[1] >= -90 &&
                                coords[1] <= 90
                            );
                        },
                        message: "Invalid coordinates",
                    },
                },
            },
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes
userSchema.index({ bloodType: 1, donorStatus: 1 });
userSchema.index({ "address.location": "2dsphere" });
userSchema.index({ "address.city": 1, "address.pinCode": 1 });

// Pre-save middleware
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    try {
        this.password = await bcrypt.hash(this.password, 10);
        next();
    } catch (error) {
        next(error);
    }
});

// Methods
userSchema.methods = {
    async isPasswordCorrect(password) {
        try {
            const isMatch = await bcrypt.compare(password, this.password);

            if (!isMatch) {
                this.loginAttempts += 1;
                if (this.loginAttempts >= 5) {
                    this.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
                }
                await this.save();
            } else {
                this.loginAttempts = 0;
                this.lastLogin = new Date();
                await this.save();
            }

            return isMatch;
        } catch (error) {
            throw new ApiError(500, "Password verification failed");
        }
    },

    generateAccessToken() {
        return jwt.sign(
            {
                _id: this._id,
                email: this.email,
                bloodType: this.bloodType,
                donorStatus: this.donorStatus,
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
        );
    },

    generateRefreshToken() {
        return jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        });
    },

    async updateDonationHistory(donationData) {
        this.bloodDonationHistory.push(donationData);
        this.totalDonations += 1;
        this.lastDonationDate = donationData.date;
        this.nextEligibleDate = new Date(donationData.date);
        this.nextEligibleDate.setDays(this.nextEligibleDate.getDays() + 56); // 56 days waiting period
        return this.save();
    },

    isEligibleToDonate() {
        if (this.donorStatus === "Permanent Deferral") return false;
        if (!this.nextEligibleDate) return true;
        return new Date() >= this.nextEligibleDate;
    },
};

export const User = mongoose.model("User", userSchema);
