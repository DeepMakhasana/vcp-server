import { Request, Response, NextFunction } from "express";
import config from "../config";
import { HttpError } from "http-errors";

const globalErrorHandel = (error: HttpError, req: Request, res: Response, next: NextFunction) => {
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
