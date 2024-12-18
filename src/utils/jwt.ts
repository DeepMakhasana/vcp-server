import jwt from "jsonwebtoken";
import config from "../config";
import { IUser } from "../auth/auth.controller";

export type UserWithoutPassword = Omit<IUser, "password">;

export const generateToken = (user: UserWithoutPassword, role: string) => {
    return jwt.sign({ ...user, userRole: role }, config.jwtSecret as string);
    // last parameter of sign function {expiresIn: "30d",}
};

export const verifyToken = (token: string) => {
    return jwt.verify(token, config.jwtSecret as string) as UserWithoutPassword;
};
