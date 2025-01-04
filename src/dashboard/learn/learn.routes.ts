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

const learnProgressSchema = Joi.object({
    purchaseId: Joi.number().integer().positive().min(1).required().messages({
        "number.base": "Purchase ID must be a number.",
        "number.integer": "Purchase ID must be an integer.",
        "number.positive": "Purchase ID must be a positive number.",
        "number.min": "Purchase ID must be greater than zero.",
        "any.required": "Purchase ID is required.",
    }),
    courseId: Joi.number().integer().positive().min(1).required().messages({
        "number.base": "Course ID must be a number.",
        "number.integer": "Course ID must be an integer.",
        "number.positive": "Course ID must be a positive number.",
        "number.min": "Course ID must be greater than zero.",
        "any.required": "Course ID is required.",
    }),
});

learnRouter.get("/:slug/:purchaseId", authenticationMiddleware(["student", "creator"]), getLearnCourseBySlug);

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
