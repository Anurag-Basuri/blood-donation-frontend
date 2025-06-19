import Joi from 'joi';

export const hospitalValidationRules = {
	register: Joi.object({
		name: Joi.string().required().min(3).max(100).trim(),
		email: Joi.string().email().required().lowercase().trim(),
		password: Joi.string()
			.min(8)
			.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)
			.required(),
		registrationNumber: Joi.string().required(),
		address: Joi.object({
			street: Joi.string().required(),
			city: Joi.string().required(),
			state: Joi.string().required(),
			pinCode: Joi.string()
				.pattern(/^\d{6}$/)
				.required(),
			location: Joi.object({
				type: Joi.string().valid('Point'),
				coordinates: Joi.array().items(Joi.number()).length(2),
			}),
		}).required(),
		contactPerson: Joi.object({
			name: Joi.string().required(),
			phone: Joi.string()
				.pattern(/^\+?[\d\s-]{10,}$/)
				.required(),
			email: Joi.string().email(),
			designation: Joi.string(),
		}).required(),
		type: Joi.string().valid('GOVERNMENT', 'PRIVATE', 'MILITARY', 'CHARITABLE').required(),
		specialties: Joi.array().items(Joi.string()),
		emergencyContact: Joi.object({
			name: Joi.string().required(),
			phone: Joi.string()
				.pattern(/^\+?[\d\s-]{10,}$/)
				.required(),
			email: Joi.string().email(),
			available24x7: Joi.boolean(),
		}),
	}),

	inventoryUpdate: Joi.object({
		bloodGroup: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-').required(),
		operation: Joi.string().valid('add', 'deduct').required(),
		units: Joi.number().min(1).required(),
		source: Joi.string().required(),
		expiryDate: Joi.date().greater('now').when('operation', {
			is: 'add',
			then: Joi.required(),
		}),
	}),

	bloodRequest: Joi.object({
		bloodGroups: Joi.array()
			.items(Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'))
			.min(1)
			.required(),
		urgencyLevel: Joi.string().valid('NORMAL', 'URGENT', 'EMERGENCY').required(),
		requiredBy: Joi.date().greater('now').required(),
		patientInfo: Joi.object({
			name: Joi.string().required(),
			age: Joi.number(),
			gender: Joi.string().valid('MALE', 'FEMALE', 'OTHER'),
			bloodGroup: Joi.string(),
			ward: Joi.string(),
			condition: Joi.string(),
		}).required(),
	}),

	analytics: Joi.object({
		startDate: Joi.date(),
		endDate: Joi.date().greater(Joi.ref('startDate')),
		type: Joi.string().valid('inventory', 'requests', 'donations', 'connections'),
	}),
};

export default hospitalValidationRules;
