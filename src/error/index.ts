import { Request, Response, NextFunction } from "express";
import config from "../config";
import { HttpError } from "http-errors";
import { Prisma } from "@prisma/client";

const globalErrorHandel = (error: HttpError, req: Request, res: Response, next: NextFunction) => {
    console.log("in global", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle Prisma foreign key constraint error (code P2003)
        if (error.code === "P2003") {
            res.status(400).json({
                success: false,
                message:
                    "Unable to delete this item because it is linked to other resources. Please remove child items first and try again.",
            });
            return;
        }
    }
    const statusCode = error?.statusCode || 500;
    console.log("Error global handler: ", error);
    res.status(statusCode).json({
        success: false,
        message: error.message,
        errorStack: config.nodeEnv == "development" ? error.stack : "",
    });
    return;
};

export default globalErrorHandel;
