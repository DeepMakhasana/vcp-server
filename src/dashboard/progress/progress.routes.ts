import express from "express";
import { authenticationMiddleware } from "../../middlewares/auth.middleware";
import Joi from "joi";
import { validate } from "../../middlewares/validator.middleware";
import { createProgress } from "./progress.controller";

const progressRouter = express.Router();

const progressCreateSchema = Joi.object({
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

progressRouter.post(
    "/",
    authenticationMiddleware(["student", "creator"]),
    validate(progressCreateSchema),
    createProgress
);

export default progressRouter;
