import Joi from "joi";

// Constants
const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const DONATION_TYPES = ["WHOLE_BLOOD", "PLASMA", "PLATELETS"];
const URGENCY_LEVELS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

const userValidationRules = {
    register: Joi.object({
        fullName: Joi.string().min(3).max(50).trim().required(),
        email: Joi.string().email().trim().lowercase().required(),
        password: Joi.string()
            .min(8)
            .pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)
            .required(),
        phone: Joi.string().pattern(/^\+?[\d\s-]{10,}$/).required(),
        bloodType: Joi.string().valid(...BLOOD_TYPES).required(),
        address: Joi.object({
            street: Joi.string().allow(""),
            city: Joi.string().trim().required(),
            state: Joi.string().trim().required(),
            pinCode: Joi.string().pattern(/^\d{6}$/).required(),
        }),
        dateOfBirth: Joi.date().max("now").required(),
    }),

    login: Joi.object({
        email: Joi.string().email().trim().lowercase().required(),
        password: Joi.string().required(),
    }),

    profileUpdate: Joi.object({
        fullName: Joi.string().min(3).max(50),
        phone: Joi.string().pattern(/^\+?[\d\s-]{10,}$/),
        address: Joi.object({
            street: Joi.string().allow(""),
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
            .invalid(Joi.ref("oldPassword"))
            .required(),
    }),

    emergencyContact: Joi.object({
        name: Joi.string().min(3).max(50).required(),
        relationship: Joi.string().required(),
        phone: Joi.string().pattern(/^\+?[\d\s-]{10,}$/).required(),
        alternatePhone: Joi.string().pattern(/^\+?[\d\s-]{10,}$/).optional(),
        email: Joi.string().email().optional(),
        address: Joi.string().optional(),
    }),

    appointment: Joi.object({
        facilityId: Joi.string().required(),
        date: Joi.date().greater("now").required(),
        slotTime: Joi.string().required(),
        donationType: Joi.string().valid(...DONATION_TYPES).required(),
        specialRequirements: Joi.string().optional(),
    }),

    bloodRequest: Joi.object({
        bloodGroups: Joi.array()
            .items(Joi.string().valid(...BLOOD_TYPES))
            .min(1)
            .required(),
        hospitalId: Joi.string().required(),
        urgencyLevel: Joi.string().valid(...URGENCY_LEVELS).required(),
        patientInfo: Joi.object({
            name: Joi.string().required(),
            age: Joi.number().min(0).max(150),
            gender: Joi.string().valid("MALE", "FEMALE", "OTHER"),
            condition: Joi.string(),
        }).required(),
        requiredBy: Joi.date().greater("now").required(),
        quantity: Joi.number().min(1).required(),
        purpose: Joi.string().required(),
    }),
};

export { userValidationRules };
