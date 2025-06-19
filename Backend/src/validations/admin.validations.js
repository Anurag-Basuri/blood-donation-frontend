export const adminValidationRules = {
	register: {
		fullName: {
			notEmpty: true,
			isLength: { min: 3 },
		},
		email: {
			isEmail: true,
			normalizeEmail: true,
		},
		password: {
			isLength: { min: 8 },
			matches: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
		},
		role: {
			isIn: ['admin', 'moderator'],
		},
	},
	login: {
		email: {
			isEmail: true,
			normalizeEmail: true,
		},
		password: {
			notEmpty: true,
		},
	},
	verification: {
		status: {
			isIn: ['approved', 'rejected'],
		},
		remarks: {
			optional: true,
			isLength: { min: 10, max: 500 },
		},
	},
	customAnalytics: {
		startDate: {
			optional: true,
			isDate: true,
		},
		endDate: {
			optional: true,
			isDate: true,
		},
		metrics: {
			optional: true,
			isArray: true,
		},
	},
};
