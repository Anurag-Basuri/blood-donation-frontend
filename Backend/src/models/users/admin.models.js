import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ApiError } from '../../utils/ApiError.js';

const adminSchema = new mongoose.Schema(
	{
		fullName: {
			type: String,
			required: [true, 'Full name is required'],
			trim: true,
			minlength: [3, 'Name must be at least 3 characters'],
		},
		email: {
			type: String,
			required: [true, 'Email is required'],
			unique: true,
			lowercase: true,
			trim: true,
			match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/, 'Please enter a valid email'],
		},
		password: {
			type: String,
			required: [true, 'Password is required'],
			minlength: [8, 'Password must be at least 8 characters'],
			select: false,
		},
		role: {
			type: String,
			default: 'admin',
		},
		refreshToken: {
			type: String,
			select: false,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		tokenVersion: {
			type: Number,
			default: 0,
		},
	},
	{
		timestamps: true,
	}
);

// Hash password before saving
adminSchema.pre('save', async function (next) {
	if (!this.isModified('password') || typeof this.password !== 'string') return next();
	this.password = await bcrypt.hash(this.password, 12);
	next();
});

// Instance methods
adminSchema.methods = {
	isPasswordCorrect: async function (password) {
		try {
			return await bcrypt.compare(password, this.password);
		} catch (error) {
			throw new ApiError(500, 'Password verification failed');
		}
	},

	generateAccessToken: function () {
		return jwt.sign(
			{
				_id: this._id,
				role: this.role,
				email: this.email,
				fullName: this.fullName,
				permissions: this.permissions,
				tokenVersion: this.tokenVersion,
			},
			process.env.ACCESS_TOKEN_SECRET,
			{ expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
		);
	},

	toSafeObject: function () {
		const { _id, fullName, email, role, permissions, isActive } = this;
		return { _id, fullName, email, role, permissions, isActive };
	},
};

// Static methods
adminSchema.statics = {
	findByEmailWithPassword: function (email) {
		return this.findOne({ email }).select('+password');
	},
};

const Admin = mongoose.model('Admin', adminSchema);
export { Admin };
