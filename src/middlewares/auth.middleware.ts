import { NextFunction, Request, Response } from "express";
import { UserWithoutPassword, verifyToken } from "../utils/jwt";
import createHttpError from "http-errors";

export interface RequestWithUser extends Request {
    user?: UserWithoutPassword;
}

export const authenticationMiddleware = (req: RequestWithUser, res: Response, next: NextFunction) => {
    const token = req.header("Authorization")?.split(" ")[1]; // Expecting "Bearer <token>"
    // console.log("header", req.header("Authorization"));

    if (!token) {
        return next(createHttpError(401, "Access denied, no token provided"));
    }

    try {
        // Verify the token and attach decoded data to `req.user`
        const decoded: UserWithoutPassword = verifyToken(token);
        req.user = decoded;
        next(); // Continue to the next middleware or route handler
    } catch (error) {
        return next(createHttpError(403, "Invalid token"));
    }
};
