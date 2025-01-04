import express from "express";
import { authenticationMiddleware } from "../../middlewares/auth.middleware";
import Joi from "joi";
import { validate } from "../../middlewares/validator.middleware";
import { createProgress } from "./progress.controller";

const progressRouter = express.Router();

const progressCreateSchema = Joi.object({
    purchaseId: Joi.number().integer().positive().min(1).required().messages({
        "number.base": "Purchase ID must be a number.",
        "number.integer": "Purchase ID must be an integer.",
        "number.positive": "Purchase ID must be a positive number.",
        "number.min": "Purchase ID must be greater than zero.",
        "any.required": "Purchase ID is required.",
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
