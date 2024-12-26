import jwt from "jsonwebtoken";
import config from "../config";
import { TokenType, TokenWithoutRolesType } from "../auth/types";
import createHttpError from "http-errors";

export const generateToken = (user: TokenWithoutRolesType, role: string[]) => {
    return jwt.sign({ ...user, roles: role }, config.jwtSecret as string);
    // last parameter of sign function {expiresIn: "30d",}
};

export const verifyToken = (token: string): TokenType => {
    if (!config.jwtSecret) {
        throw new Error("JWT secret is not defined");
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, config.jwtSecret) as TokenType;

        // Optional: Validate the presence of essential fields in the payload
        if (
            !decoded.id ||
            !decoded.email ||
            !decoded.roles ||
            !decoded.name ||
            !decoded.image ||
            !decoded.mobile ||
            !decoded.createdAt ||
            !decoded.updatedAt
        ) {
            throw createHttpError(400, "Invalid token payload");
        }

        return decoded; // Return the validated payload
    } catch (error: any) {
        // Handle token errors
        if (error.name === "TokenExpiredError") {
            throw createHttpError(401, "Token has expired");
        }
        if (error.name === "JsonWebTokenError") {
            throw createHttpError(403, "Invalid token");
        }
        throw createHttpError(500, "An error occurred during token verification");
    }
};
