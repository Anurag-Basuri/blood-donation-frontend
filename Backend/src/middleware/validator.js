import { ValidationError } from "../utils/errors.js";
import Joi from "joi";

export const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, {
            abortEarly: false,
            allowUnknown: false,
        });

        if (error) {
            const errorMessage = error.details
                .map((detail) => detail.message)
                .join(", ");
            throw new ValidationError(errorMessage);
        }

        next();
    };
};

// Validation schemas
export const bloodDonationSchema = Joi.object({
    userId: Joi.string().required(),
    centerId: Joi.string().required(),
    bloodGroup: Joi.string()
        .valid("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-")
        .required(),
    donationAmount: Joi.number().min(200).max(500),
    healthMetrics: Joi.object({
        hemoglobin: Joi.number(),
        bloodPressure: Joi.string(),
        weight: Joi.number(),
        temperature: Joi.number(),
    }),
});
