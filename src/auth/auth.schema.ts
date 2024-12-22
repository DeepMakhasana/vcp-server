import Joi from "joi";

export const sendEmailOtpSchema = Joi.object({
    email: Joi.string().email().required().messages({
        "string.email": '"email" must be a valid email address',
        "any.required": '"email" is required',
    }),
});

export const verifyEmailOtpSchema = Joi.object({
    email: Joi.string().email().required().messages({
        "string.email": '"email" must be a valid email address',
        "any.required": '"email" is required',
    }),
    otp: Joi.string()
        .pattern(/^[0-9]{6}$/)
        .required()
        .messages({
            "string.pattern.base": '"OTP" must be exactly 6 digits',
            "any.required": '"OTP" is required',
        }),
});

export const creatorRegisterSchema = Joi.object({
    name: Joi.string().min(3).max(70).required().messages({
        "string.empty": '"name" cannot be empty',
        "string.min": '"name" must have at least 3 characters',
        "string.max": '"name" must not exceed 70 characters',
    }),
    email: Joi.string().email().required().messages({
        "string.email": '"email" must be a valid email address',
        "any.required": '"email" is required',
    }),
    mobile: Joi.string()
        .pattern(/^[0-9]{10}$/)
        .required()
        .messages({
            "string.pattern.base": '"mobile" must be exactly 10 digits',
        }),
    password: Joi.string().min(8).required().messages({
        "string.min": '"password" must be at least 8 characters long',
    }),
    domain: Joi.string().max(255).required().messages({
        "string.empty": '"domain" cannot be empty',
    }),
    bio: Joi.string().required().messages({
        "string.empty": '"bio" cannot be empty',
    }),
    role: Joi.string().max(70).required().messages({
        "string.empty": '"role" cannot be empty',
        "string.max": '"role" must not exceed 70 characters',
    }),
});

export const userRegisterSchema = Joi.object({
    name: Joi.string().min(3).max(70).required().messages({
        "string.empty": '"name" cannot be empty',
        "string.min": '"name" must have at least 3 characters',
        "string.max": '"name" must not exceed 70 characters',
    }),
    email: Joi.string().email().required().messages({
        "string.email": '"email" must be a valid email address',
        "any.required": '"email" is required',
    }),
    mobile: Joi.string()
        .pattern(/^[0-9]{10}$/)
        .required()
        .messages({
            "string.pattern.base": '"mobile" must be exactly 10 digits',
        }),
    password: Joi.string().min(8).required().messages({
        "string.min": '"password" must be at least 8 characters long',
    }),
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        "string.email": '"email" must be a valid email address',
        "any.required": '"email" is required',
    }),
    password: Joi.string().min(8).required().messages({
        "string.min": '"password" must be at least 8 characters long',
    }),
});
