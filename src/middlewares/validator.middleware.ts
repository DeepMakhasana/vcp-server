import { Request, Response, NextFunction } from "express";
import { ObjectSchema } from "joi";

/**
 * Middleware for validating request data using Joi.
 * @param schema - Joi schema for validation.
 * @param property - The part of the request to validate (e.g., body, query, params).
 */
export const validate = (schema: ObjectSchema, property: keyof Request = "body") => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const { error, value } = schema.validate(req[property], { abortEarly: false });

        if (error) {
            const errors = error.details.map((detail) => detail.message);
            res.status(400).json({ success: false, message: errors.join(", ") });
            return;
        }

        // Attach validated data back to the request
        (req[property] as any) = value;
        next();
    };
};
