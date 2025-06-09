import Joi from "joi";

export const ngoValidationRules = {
    register: Joi.object({
        name: Joi.string()
            .required()
            .min(3)
            .max(100)
            .trim(),
        email: Joi.string()
            .email()
            .required()
            .lowercase()
            .trim(),
        password: Joi.string()
            .min(8)
            .pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)
            .required(),
        contactPerson: Joi.object({
            name: Joi.string().required(),
            phone: Joi.string().pattern(/^\+?[\d\s-]{10,}$/).required(),
            email: Joi.string().email(),
            designation: Joi.string()
        }).required(),
        address: Joi.object({
            street: Joi.string().required(),
            city: Joi.string().required(),
            state: Joi.string().required(),
            pinCode: Joi.string().pattern(/^\d{6}$/).required(),
            location: Joi.object({
                type: Joi.string().valid("Point"),
                coordinates: Joi.array().items(Joi.number()).length(2)
            })
        }).required(),
        regNumber: Joi.string().required(),
        organizationType: Joi.string().required(),
        operatingHours: Joi.object({
            start: Joi.string(),
            end: Joi.string(),
            days: Joi.array().items(
                Joi.string().valid(
                    "Monday", "Tuesday", "Wednesday",
                    "Thursday", "Friday", "Saturday", "Sunday"
                )
            )
        })
    }),

    facilityCreate: Joi.object({
        name: Joi.string().required(),
        type: Joi.string().valid("CENTER", "CAMP").required(),
        location: Joi.object({
            coordinates: Joi.array().items(Joi.number()).length(2).required(),
            address: Joi.object({
                street: Joi.string(),
                city: Joi.string().required(),
                state: Joi.string().required(),
                pinCode: Joi.string().pattern(/^\d{6}$/).required()
            })
        }).required(),
        schedule: Joi.object({
            startDate: Joi.date().when('type', {
                is: 'CAMP',
                then: Joi.required()
            }),
            endDate: Joi.date().when('type', {
                is: 'CAMP',
                then: Joi.required()
            }),
            slots: Joi.array().items(
                Joi.object({
                    time: Joi.string().required(),
                    capacity: Joi.number().min(1).required()
                })
            )
        }).required()
    }),

    bloodRequestResponse: Joi.object({
        action: Joi.string()
            .valid("ACCEPTED", "REJECTED", "COMPLETED")
            .required(),
        notes: Joi.string(),
        assignedDonors: Joi.when('action', {
            is: 'ACCEPTED',
            then: Joi.array().items(Joi.string()).min(1).required(),
            otherwise: Joi.forbidden()
        })
    }),

    analyticsQuery: Joi.object({
        startDate: Joi.date(),
        endDate: Joi.date().greater(Joi.ref('startDate')),
        metrics: Joi.array().items(
            Joi.string().valid(
                "donations", "requests", "inventory",
                "facilities", "impact"
            )
        )
    })
};

export default ngoValidationRules;