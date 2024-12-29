import { Request, Response, NextFunction } from "express";
import config from "../config";
import { HttpError } from "http-errors";
import { Prisma } from "@prisma/client";

const globalErrorHandel = (err: HttpError, req: Request, res: Response, next: NextFunction) => {
    let statusCode = 500; // Default to internal server error
    let message = "An unexpected error occurred. Please try again later."; // Generic message for unknown errors
    // Handle specific Prisma errors
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        switch (err.code) {
            case "P2000": // Value too long for a column
                statusCode = 400;
                message = "One of the inputs is too long. Please shorten it and try again.";
                break;
            case "P2002": // Unique constraint violation
                statusCode = 400;
                const targetFields = (err.meta?.target as string[] | undefined) || [];
                message = `The provided value already exists. Please use a different value for "${targetFields.join(
                    ", "
                )}".`;
                break;
            case "P2003": // Foreign key constraint violation
                statusCode = 400;
                message = "The provided data is linked to another record and cannot be processed.";
                break;
            case "P2025": // Record not found
                statusCode = 404;
                message = "The requested resource could not be found.";
                break;
            default: // Handle other known errors
                statusCode = 400;
                message = "A database error occurred. Please check your input and try again.";
        }
    } else if (err instanceof Prisma.PrismaClientValidationError) {
        statusCode = 400;
        message = "Invalid input data. Please ensure all fields are correct.";
    } else if (err instanceof Prisma.PrismaClientRustPanicError) {
        statusCode = 500;
        message = "A critical error occurred. Please try again later.";
    } else if (err instanceof Prisma.PrismaClientInitializationError) {
        statusCode = 500;
        message = "Failed to connect to the database. Please try again later.";
    } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
        statusCode = 500;
        message = "An unexpected database error occurred. Please contact support.";
    } else if (err.code === "ECONNREFUSED") {
        statusCode = 500;
        message = "Could not connect to the database. Please try again later.";
    }

    console.log("Error global handler: ", err);
    res.status(statusCode).json({
        success: false,
        message: err.message || message,
        errorStack: config.nodeEnv == "development" ? err.stack : "",
    });
    return;
};

export default globalErrorHandel;
