import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";
import createHttpError from "http-errors";
import { TokenType } from "../auth/types";

export interface RequestWithUser extends Request {
    user?: TokenType;
}

export const authenticationMiddleware = (allowedRoles: string[]) => {
    return (req: RequestWithUser, res: Response, next: NextFunction) => {
        console.log("Authenticate");
        const token = req.header("Authorization")?.split(" ")[1]; // Expecting "Bearer <token>"

        if (!token) {
            return next(createHttpError(401, "Access denied, no token provided"));
        }

        try {
            // Verify the token and attach decoded data to `req.user`
            const decoded: TokenType = verifyToken(token);
            req.user = decoded;

            // Check if the user has at least one of the allowed roles
            const roles: string[] = req.user.roles || []; // Assuming `roles` is an array in `UserWithoutPassword`
            const hasAccess = roles.some((role) => allowedRoles.includes(role));

            if (!hasAccess) {
                return next(createHttpError(403, "Access denied, insufficient permissions"));
            }

            next(); // Continue to the next middleware or route handler
        } catch (error) {
            return next(createHttpError(403, "Invalid token"));
        }
    };
};
