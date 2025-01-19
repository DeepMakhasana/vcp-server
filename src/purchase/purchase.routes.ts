import express from "express";
import { validate } from "../middlewares/validator.middleware";
import Joi from "joi";
import { authenticationMiddleware } from "../middlewares/auth.middleware";
import { getUserPurchaseCourse, purchaseOrder, purchaseOrderVerify } from "./purchase.controller";
const purchaseRouter = express.Router();

const purchaseSchema = Joi.object({
    courseId: Joi.number().integer().positive().required().messages({
        "number.base": "Course ID must be a number.",
        "number.integer": "Course ID must be an integer.",
        "number.positive": "Course ID must be a positive number.",
        "any.required": "Course ID is required.",
    }),
    userId: Joi.number().integer().positive().required().messages({
        "number.base": "User ID must be a number.",
        "number.integer": "User ID must be an integer.",
        "number.positive": "User ID must be a positive number.",
        "any.required": "User ID is required.",
    }),
    price: Joi.number().integer().min(0).required().messages({
        "number.base": "Price must be a number.",
        "number.integer": "Price must be an integer.",
        "number.min": "Price must be at least 0.",
        "any.required": "Price is required.",
    }),
    duration: Joi.number().integer().min(0).required().messages({
        "number.base": "Duration must be a number.",
        "number.integer": "Duration must be an integer.",
        "number.min": "Duration must be at least 0.",
        "any.required": "Duration is required.",
    }),
});

// ROUTE 1 : Create Order Api Using POST Method http://localhost:8000/api/purchase/order
purchaseRouter.post("/order", authenticationMiddleware(["student"]), validate(purchaseSchema), purchaseOrder);

// ROUTE 2 : Create Verify Api Using POST Method http://localhost:8000/api/purchase/verify
purchaseRouter.post("/verify", authenticationMiddleware(["student"]), purchaseOrderVerify);

purchaseRouter.get("/", authenticationMiddleware(["student"]), getUserPurchaseCourse);

export default purchaseRouter;
