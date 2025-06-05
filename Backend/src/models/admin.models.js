import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const adminSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: [true, "Full name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
                "Please enter a valid email",
            ],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [8, "Password must be at least 8 characters long"],
            select: false, // Exclude from queries by default
        },
        role: {
            type: String,
            enum: ["admin", "superadmin"],
            default: "admin",
            immutable: true, // Cannot change role after creation
        },
        refreshToken: {
            type: String,
            select: false, // Hide from all outputs unless explicitly selected
        },
        lastLogin: {
            type: Date,
        },
        loginAttempts: {
            type: Number,
            default: 0,
        },
        lockedUntil: {
            type: Date,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Pre-save: hash password if modified
adminSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 12); // stronger hashing
    next();
});

// Compare raw password with hashed
adminSchema.methods.isPasswordCorrect = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT Access Token
adminSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            role: this.role,
            email: this.email,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
};

// Generate JWT Refresh Token
adminSchema.methods.generateRefreshToken = function () {
    return jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    });
};

// Lock account after too many failed attempts (optional future implementation)
adminSchema.methods.isAccountLocked = function () {
    return this.lockedUntil && this.lockedUntil > Date.now();
};

// Create model
const Admin = mongoose.model("Admin", adminSchema);
export default Admin;
