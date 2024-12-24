import Joi from "joi";

export const courseValidationSchema = Joi.object({
    title: Joi.string().max(70).required().messages({
        "string.empty": "Title is required.",
        "string.max": "Title must not exceed 70 characters.",
    }),
    description: Joi.string().required().messages({
        "string.empty": "Description is required.",
    }),
    price: Joi.number().min(0).required().messages({
        "number.base": "Price must be a valid number.",
        "number.min": "Price cannot be negative.",
    }),
    image: Joi.string().required().messages({
        "string.empty": "Image is required.",
    }),
    highlights: Joi.string().required().messages({
        "string.empty": "Highlights are required.",
    }),
    outcomes: Joi.string().required().messages({
        "string.empty": "Learning outcomes are required.",
    }),
    prerequisites: Joi.string().required().messages({
        "string.empty": "Prerequisites are required.",
    }),
    status: Joi.boolean().default(false).messages({
        "boolean.base": "Status must be a boolean value.",
    }),
});

export const moduleSchema = Joi.object({
    title: Joi.string().max(100).required().messages({
        "string.base": '"title" must be a string',
        "string.empty": '"title" cannot be an empty string',
        "string.max": '"title" cannot be longer than 100 characters',
        "any.required": '"title" is required',
    }),

    courseId: Joi.number().integer().greater(0).required().messages({
        "number.base": '"courseId" must be a number',
        "number.integer": '"courseId" must be an integer',
        "number.greater": '"courseId" must be a positive number greater than 0',
        "any.required": '"courseId" is required',
    }),
});

export const lessonSchema = Joi.object({
    title: Joi.string().max(100).required().messages({
        "string.base": "Title must be a string.",
        "string.empty": "Title is required.",
        "string.max": "Title must not exceed 100 characters.",
        "any.required": "Title is required.",
    }),
    moduleId: Joi.number().integer().positive().required().messages({
        "number.base": "Module ID must be a number.",
        "number.integer": "Module ID must be an integer.",
        "number.positive": "Module ID must be a positive number.",
        "any.required": "Module ID is required.",
    }),
    isVideo: Joi.boolean().required().messages({
        "boolean.base": "isVideo must be a boolean value.",
        "any.required": "isVideo is required.",
    }),
});
