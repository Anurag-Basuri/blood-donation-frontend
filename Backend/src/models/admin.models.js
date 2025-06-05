import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ApiError } from "../utils/ApiError.js";

const adminSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: [true, "Full name is required"],
            trim: true,
            minlength: [3, "Name must be at least 3 characters"],
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
            index: true, // Optimize email queries
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [8, "Password must be at least 8 characters long"],
            validate: {
                validator: function (password) {
                    // Require at least one uppercase, lowercase, number, and special character
                    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
                        password
                    );
                },
                message:
                    "Password must contain at least one uppercase letter, lowercase letter, number, and special character",
            },
            select: false,
        },
        role: {
            type: String,
            enum: ["admin", "superadmin"],
            default: "admin",
            immutable: true,
        },
        permissions: [
            {
                type: String,
                enum: [
                    "manage_users",
                    "manage_donations",
                    "manage_hospitals",
                    "manage_ngos",
                    "view_analytics",
                    "manage_admins",
                    "system_settings",
                ],
            },
        ],
        refreshToken: {
            type: String,
            select: false,
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
        lastPasswordChange: {
            type: Date,
            default: Date.now,
        },
        requirePasswordChange: {
            type: Boolean,
            default: false,
        },
        twoFactorEnabled: {
            type: Boolean,
            default: false,
        },
        twoFactorSecret: {
            type: String,
            select: false,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for optimization
adminSchema.index({ email: 1 });
adminSchema.index({ role: 1 });

// Pre-save middleware
adminSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    try {
        // Check password history
        if (
            this.previousPasswords &&
            this.previousPasswords.some(
                async (oldPass) => await bcrypt.compare(this.password, oldPass)
            )
        ) {
            throw new Error("Cannot reuse previous passwords");
        }

        this.password = await bcrypt.hash(this.password, 12);
        this.lastPasswordChange = Date.now();
        next();
    } catch (error) {
        next(error);
    }
});

// Methods
adminSchema.methods = {
    // Verify password
    isPasswordCorrect: async function (candidatePassword) {
        try {
            const isMatch = await bcrypt.compare(
                candidatePassword,
                this.password
            );

            // Handle login attempts
            if (!isMatch) {
                this.loginAttempts += 1;
                if (this.loginAttempts >= 5) {
                    this.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
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

    // Generate access token
    generateAccessToken: function () {
        return jwt.sign(
            {
                _id: this._id,
                role: this.role,
                email: this.email,
                permissions: this.permissions,
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
        );
    },

    // Check specific permission
    hasPermission: function (permission) {
        return (
            this.role === "superadmin" || this.permissions.includes(permission)
        );
    },

    // Check if account is locked
    isAccountLocked: function () {
        return this.lockedUntil && this.lockedUntil > new Date();
    },
};

// Statics
adminSchema.statics = {
    // Find active admins
    findActive: function () {
        return this.find({ isActive: true });
    },

    // Find by email with password
    findByEmailWithPassword: function (email) {
        return this.findOne({ email }).select("+password");
    },
};

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;
