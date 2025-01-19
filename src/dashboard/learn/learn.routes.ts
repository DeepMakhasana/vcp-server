import express from "express";
import { authenticationMiddleware } from "../../middlewares/auth.middleware";
import Joi from "joi";
import { validate } from "../../middlewares/validator.middleware";
import {
    courseProgress,
    createTaskPresignedUrl,
    createVideoPresignedUrl,
    getLearnCourseBySlug,
} from "./learn.controller";

const learnRouter = express.Router();

const learnCreateSchema = Joi.object({
    purchaseId: Joi.string()
        .pattern(/^order_[a-zA-Z0-9]+$/)
        .required()
        .messages({
            "string.empty": "Razorpay order ID is required.",
            "string.pattern.base": "Razorpay order ID must start with 'order_' followed by alphanumeric characters.",
        }),
    lessonId: Joi.number().integer().positive().min(1).required().messages({
        "number.base": "Lesson ID must be a number.",
        "number.integer": "Lesson ID must be an integer.",
        "number.positive": "Lesson ID must be a positive number.",
        "number.min": "Lesson ID must be greater than zero.",
        "any.required": "Lesson ID is required.",
    }),
});

const learnProgressSchema = Joi.object({
    purchaseId: Joi.string()
        .pattern(/^order_[a-zA-Z0-9]+$/)
        .required()
        .messages({
            "string.empty": "Razorpay order ID is required.",
            "string.pattern.base": "Razorpay order ID must start with 'order_' followed by alphanumeric characters.",
        }),
    courseId: Joi.number().integer().positive().min(1).required().messages({
        "number.base": "Course ID must be a number.",
        "number.integer": "Course ID must be an integer.",
        "number.positive": "Course ID must be a positive number.",
        "number.min": "Course ID must be greater than zero.",
        "any.required": "Course ID is required.",
    }),
});

export const courseBySlugSchema = Joi.object({
    slug: Joi.string()
        .pattern(/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/)
        .max(100) // Match the max length in your Prisma schema
        .required()
        .messages({
            "string.pattern.base":
                "Slug must contain only lowercase letters, numbers, hyphens, or underscores, and cannot start or end with a hyphen/underscore.",
            "string.max": "Slug cannot exceed 100 characters.",
            "string.empty": "Slug is required.",
        }),
    purchaseId: Joi.string()
        .pattern(/^order_[a-zA-Z0-9]+$/)
        .required()
        .messages({
            "string.empty": "Razorpay order ID is required.",
            "string.pattern.base": "Razorpay order ID must start with 'order_' followed by alphanumeric characters.",
        }),
});

learnRouter.get(
    "/:slug/:purchaseId",
    authenticationMiddleware(["student", "creator"]),
    validate(courseBySlugSchema, "params"),
    getLearnCourseBySlug
);

learnRouter.get(
    "/video/:purchaseId/:lessonId",
    authenticationMiddleware(["student", "creator"]),
    validate(learnCreateSchema, "params"),
    createVideoPresignedUrl
);
learnRouter.get(
    "/task/:purchaseId/:lessonId",
    authenticationMiddleware(["student", "creator"]),
    validate(learnCreateSchema, "params"),
    createTaskPresignedUrl
);

learnRouter.get(
    "/progress/:purchaseId/:courseId",
    authenticationMiddleware(["student", "creator"]),
    validate(learnProgressSchema, "params"),
    courseProgress
);

export default learnRouter;
