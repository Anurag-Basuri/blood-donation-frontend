import Joi from 'joi';

// Constants
const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const userValidationRules = {
	register: Joi.object({
		fullName: Joi.string().min(3).max(50).trim().required(),
		email: Joi.string().email().lowercase().trim().required(),
		password: Joi.string()
			.min(8)
			.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)
			.required()
			.messages({
				'string.pattern.base': 'Password must contain at least one letter and one number',
			}),
		phone: Joi.string()
			.pattern(/^\+?[\d\s-]{10,}$/)
			.required(),
		bloodType: Joi.string()
			.valid(...BLOOD_TYPES)
			.required(),
		address: Joi.object({
			street: Joi.string().allow('').optional(),
			city: Joi.string().trim().required(),
			state: Joi.string().trim().required(),
			pinCode: Joi.string()
				.pattern(/^\d{6}$/)
				.required(),
		}),
		dateOfBirth: Joi.date().max('now').required(),
	}),

	login: Joi.object({
		email: Joi.string().email().lowercase().trim().required(),
		password: Joi.string().required(),
	}),

	profileUpdate: Joi.object({
		fullName: Joi.string().min(3).max(50),
		phone: Joi.string().pattern(/^\+?[\d\s-]{10,}$/),
		address: Joi.object({
			street: Joi.string().allow('').optional(),
			city: Joi.string(),
			state: Joi.string(),
			pinCode: Joi.string().pattern(/^\d{6}$/),
		}),
	}).min(1),

	passwordChange: Joi.object({
		oldPassword: Joi.string().required(),
		newPassword: Joi.string()
			.min(8)
			.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)
			.invalid(Joi.ref('oldPassword'))
			.required()
			.messages({
				'any.invalid': 'New password must be different from old password',
				'string.pattern.base': 'Password must contain at least one letter and one number',
			}),
	}),

	getUserProfile: Joi.object({
		userId: Joi.string().hex().length(24).required(),
	}),
};

export { userValidationRules };
