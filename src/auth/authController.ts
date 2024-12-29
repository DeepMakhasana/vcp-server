import { NextFunction, Request, Response } from "express";
import prisma from "../config/prisma";
import createHttpError from "http-errors";
import { hashPassword } from "../utils/bcrypt";
import { generateToken } from "../utils/jwt";

class UserController {
    protected user;
    protected userType;
    constructor() {
        this.user = prisma.user;
        this.userType = "userType";
    }

    protected async isExist(email: string, mobile: string): Promise<{ isExist: boolean; message?: string }> {
        const userExists = await this.user.findFirst({
            where: { OR: [{ email }, { mobile }] },
        });

        if (userExists?.email === email) {
            return {
                isExist: true,
                message: "Email address already exists.",
            };
        } else if (userExists?.mobile === mobile) {
            return {
                isExist: true,
                message: "Mobile number already exists.",
            };
        }
        return { isExist: false };
    }

    protected createUserToken(user: any) {
        // Remove the password property
        Reflect.deleteProperty(user, "password");
        // generate the token
        return generateToken(user, ["student"]);
    }

    public async registerUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, email, password, mobile, creatorId } = req.body;

            // check user is exist or not
            const checkForUserExist = await this.isExist(email, mobile);
            if (checkForUserExist.isExist) return next(createHttpError(400, checkForUserExist.message as string));

            // hash the password
            const hashedPassword = await hashPassword(password);

            // insert user in database
            const createUser = await this.user.create({
                data: {
                    name,
                    email,
                    mobile,
                    password: hashedPassword,
                    isLogin: true,
                    creatorId,
                },
            });
            if (!createUser)
                return next(createHttpError(400, "some thing want wrong: try again for register your self."));

            const token = this.createUserToken(createUser);

            res.status(200).json({ message: "Register successfully.", token });
        } catch (error: any) {
            console.log(error.message);
            return next(createHttpError(400, "some thing wait wrong in user register."));
        }
    }
}

export default UserController;
