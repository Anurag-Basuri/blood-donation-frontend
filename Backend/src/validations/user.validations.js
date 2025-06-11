import Joi from "joi";

// Constants
const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const DONATION_TYPES = ["WHOLE_BLOOD", "PLASMA", "PLATELETS"];
const URGENCY_LEVELS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

const userValidationRules = {
    register: Joi.object({
        fullName: Joi.string().required().min(3).max(50).trim().messages({
            "string.min": "Name must be at least 3 characters long",
            "string.max": "Name cannot exceed 50 characters",
        }),
        email: Joi.string().email().required().lowercase().trim().messages({
            "string.email": "Please provide a valid email address",
        }),
        password: Joi.string()
            .min(8)
            .pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)
            .required()
            .messages({
                "string.pattern.base":
                    "Password must contain at least one letter and one number",
            }),
        phone: Joi.string()
            .pattern(/^\+?[\d\s-]{10,}$/)
            .required()
            .messages({
                "string.pattern.base": "Please provide a valid phone number",
            }),
        bloodType: Joi.string()
            .valid(...BLOOD_TYPES)
            .required(),
        address: Joi.object({
            street: Joi.string().trim(),
            city: Joi.string().required().trim(),
            state: Joi.string().required().trim(),
            pinCode: Joi.string()
                .pattern(/^\d{6}$/)
                .required()
                .messages({
                    "string.pattern.base": "PIN code must be 6 digits",
                }),
            location: Joi.object({
                type: Joi.string().valid("Point"),
                coordinates: Joi.array().items(Joi.number()).length(2),
            }),
        }),
        dateOfBirth: Joi.date().max("now").required().messages({
            "date.max": "Date of birth cannot be in the future",
        }),
        medicalInfo: Joi.object({
            lastCheckup: Joi.date(),
            conditions: Joi.array().items(Joi.string()),
            medications: Joi.array().items(Joi.string()),
            allergies: Joi.array().items(Joi.string()),
            weight: Joi.number().min(45),
            height: Joi.number(),
            bloodPressure: Joi.string(),
            hemoglobin: Joi.number(),
        }),
    }),

    login: Joi.object({
        email: Joi.string().email().required().lowercase(),
        password: Joi.string().required(),
        deviceInfo: Joi.object({
            deviceId: Joi.string(),
            deviceType: Joi.string(),
            platform: Joi.string(),
        }),
    }),

    profileUpdate: Joi.object({
        fullName: Joi.string().min(3).max(50),
        phone: Joi.string().pattern(/^\+?[\d\s-]{10,}$/),
        address: Joi.object({
            street: Joi.string(),
            city: Joi.string(),
            state: Joi.string(),
            pinCode: Joi.string().pattern(/^\d{6}$/),
            location: Joi.object({
                type: Joi.string().valid("Point"),
                coordinates: Joi.array().items(Joi.number()).length(2),
            }),
        }),
        preferences: Joi.object({
            notifications: Joi.object({
                email: Joi.boolean(),
                sms: Joi.boolean(),
                push: Joi.boolean(),
            }),
            donationReminders: Joi.boolean(),
            newsletterSubscription: Joi.boolean(),
        }),
        medicalInfo: Joi.object({
            lastCheckup: Joi.date(),
            conditions: Joi.array().items(Joi.string()),
            medications: Joi.array().items(Joi.string()),
            allergies: Joi.array().items(Joi.string()),
        }),
    }).min(1),

    passwordChange: Joi.object({
        oldPassword: Joi.string().required(),
        newPassword: Joi.string()
            .min(8)
            .pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)
            .required()
            .invalid(Joi.ref("oldPassword"))
            .messages({
                "any.invalid":
                    "New password must be different from old password",
            }),
    }),

    emergencyContact: Joi.object({
        name: Joi.string().required().min(3).max(50),
        relationship: Joi.string().required(),
        phone: Joi.string()
            .pattern(/^\+?[\d\s-]{10,}$/)
            .required(),
        address: Joi.string(),
        alternatePhone: Joi.string().pattern(/^\+?[\d\s-]{10,}$/),
        email: Joi.string().email(),
    }),

    appointment: Joi.object({
        facilityId: Joi.string().required(),
        date: Joi.date().greater("now").required().messages({
            "date.greater": "Appointment date must be in the future",
        }),
        slotTime: Joi.string().required(),
        donationType: Joi.string()
            .valid(...DONATION_TYPES)
            .required(),
        specialRequirements: Joi.string(),
        previousDonation: Joi.date(),
        healthDeclaration: Joi.object({
            recentIllness: Joi.boolean(),
            medications: Joi.boolean(),
            lastMeal: Joi.string(),
            restingHours: Joi.number(),
        }),
    }),

    bloodRequest: Joi.object({
        bloodGroups: Joi.array()
            .items(Joi.string().valid(...BLOOD_TYPES))
            .min(1)
            .required()
            .messages({
                "array.min": "At least one blood group must be selected",
            }),
        hospitalId: Joi.string().required(),
        urgencyLevel: Joi.string()
            .valid(...URGENCY_LEVELS)
            .required(),
        patientInfo: Joi.object({
            name: Joi.string().required(),
            age: Joi.number().min(0).max(150),
            gender: Joi.string().valid("MALE", "FEMALE", "OTHER"),
            condition: Joi.string(),
            wardNumber: Joi.string(),
            attendingDoctor: Joi.string(),
        }).required(),
        requiredBy: Joi.date().greater("now").required(),
        quantity: Joi.number().min(1).required(),
        purpose: Joi.string().required(),
        attachments: Joi.array().items(Joi.string().uri()),
    }),
};

export { userValidationRules };