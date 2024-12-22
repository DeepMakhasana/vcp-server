import Joi from "joi";

export const sendSNSVerificationCodeSchema = Joi.object({
    mobile: Joi.string()
        .pattern(/^[0-9]{10}$/)
        .required()
        .messages({
            "string.pattern.base": '"Mobile number" must be exactly 10 digits',
        }),
});
