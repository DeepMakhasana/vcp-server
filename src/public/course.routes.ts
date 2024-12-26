import express from "express";
import { getAllCreatorCourses, getCourseFullDetail } from "./course.controller";
import { validate } from "../middlewares/validator.middleware";
import Joi from "joi";

const publicCourseRouter = express.Router();

const slugSchema = Joi.object({
    slug: Joi.string()
        .pattern(/^[a-z0-9]+(-[a-z0-9]+)*$/)
        .required(),
});

publicCourseRouter.get("/courses/:id", getAllCreatorCourses);
publicCourseRouter.get("/course/:slug", validate(slugSchema, "params"), getCourseFullDetail);

export default publicCourseRouter;
