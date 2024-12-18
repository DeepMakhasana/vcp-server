import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import prisma from "../config/prisma";
import { hashPassword, verifyPassword } from "../utils/bcrypt";
import { generateToken } from "../utils/jwt";
import { generateOTP, sendVerificationEmail } from "../services/email";

interface UserRegisterParameters {
    name: string;
    email: string;
    password: string;
    mobile: string;
}

interface CreatorRegisterParameters extends UserRegisterParameters {
    domain: string;
    bio: string;
    role: string;
}

export interface IUser {
    id: number;
    name: string;
    email: string;
    password: string;
    mobile: string;
    image: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ICreator extends IUser {
    domain: string;
    bio: string;
    role: string;
}

export async function registerUser(req: Request, res: Response, next: NextFunction) {
    try {
        const { name, email, password, mobile } = req.body as UserRegisterParameters;
        // input validation
        if (!name || !email || !password || !mobile) return next(createHttpError(400, "Enter all inputs correctly."));

        // check user is exist or not
        const userExists = await prisma.user.findFirst({
            where: { OR: [{ email }, { mobile }] },
        });
        if (userExists) return next(createHttpError(400, "User already exists"));

        // hash the password
        const hashedPassword = await hashPassword(password);

        // insert user in database
        const createNewUser: IUser = await prisma.user.create({
            data: {
                name,
                email,
                mobile,
                password: hashedPassword,
                isLogin: true,
            },
        });

        if (!createNewUser)
            return next(createHttpError(400, "some thing want wrong: try again for register your self."));

        // Remove the password property
        Reflect.deleteProperty(createNewUser, "password");
        // generate the token
        const token = generateToken(createNewUser, "student");
        res.status(200).json({ user: createNewUser, message: "Register successfully.", token });
    } catch (error: any) {
        console.log(error.message);
        return next(createHttpError(400, "some thing wait wrong in user register."));
    }
}

export async function loginUser(req: Request, res: Response, next: NextFunction) {
    try {
        const { email, password } = req.body as UserRegisterParameters;
        // input validation
        if (!email || !password) return next(createHttpError(400, "Enter all inputs correctly."));

        // check user is exist or not
        const userExists = await prisma.user.findFirst({
            where: { email },
        });
        if (!userExists) return next(createHttpError(400, "User account doesn't exists"));

        // password check
        const hashedPassword = userExists.password;
        const machPassword = await verifyPassword(password, hashedPassword);

        if (!machPassword) return next(createHttpError(400, "Incorrect password."));

        // Remove the password property
        Reflect.deleteProperty(userExists, "password");
        // generate the token
        const token = generateToken(userExists, "student");
        res.status(200).json({ user: userExists, message: "Login successfully.", token });
    } catch (error: any) {
        console.log(error.message);
        return next(createHttpError(400, "some thing wait wrong in user register."));
    }
}

export async function registerCreator(req: Request, res: Response, next: NextFunction) {
    try {
        const { name, email, password, mobile, domain, bio, role } = req.body as CreatorRegisterParameters;
        // input validation
        if (!name || !email || !password || !mobile || !domain || !bio || !role)
            return next(createHttpError(400, "Enter all inputs correctly."));

        // check user is exist or not
        const creatorExists = await prisma.creator.findFirst({
            where: { OR: [{ email }, { mobile }] },
        });
        if (creatorExists) return next(createHttpError(400, "Creator mobile number is already exists."));

        // hash the password
        const hashedPassword = await hashPassword(password);

        // insert user in database
        const createNewCreator: ICreator = await prisma.creator.create({
            data: {
                name,
                email,
                mobile,
                password: hashedPassword,
                domain,
                bio,
                role,
            },
        });

        if (!createNewCreator)
            return next(createHttpError(400, "some thing want wrong: try again for register your self."));

        // Remove the password property
        Reflect.deleteProperty(createNewCreator, "password");
        // generate the token
        const token = generateToken(createNewCreator, "creator");
        res.status(200).json({ message: "Register successfully.", token });
    } catch (error: any) {
        console.log(error.message);
        return next(createHttpError(400, "some thing wait wrong in user register."));
    }
}

export async function loginCreator(req: Request, res: Response, next: NextFunction) {
    try {
        const { email, password } = req.body as UserRegisterParameters;
        // input validation
        if (!email || !password) return next(createHttpError(400, "Enter all inputs correctly."));

        // check user is exist or not
        const creatorExists = await prisma.creator.findFirst({
            where: { email },
        });
        if (!creatorExists) return next(createHttpError(400, "Creator account doesn't exists."));

        // password check
        const hashedPassword = creatorExists.password;
        const machPassword = await verifyPassword(password, hashedPassword);

        if (!machPassword) return next(createHttpError(400, "Incorrect password."));

        // Remove the password property
        Reflect.deleteProperty(creatorExists, "password");
        // generate the token
        const token = generateToken(creatorExists, "creator");
        res.status(200).json({ user: creatorExists, message: "Login successfully.", token });
    } catch (error: any) {
        console.log(error.message);
        return next(createHttpError(400, "some thing wait wrong in user register."));
    }
}

export async function sendVerifyUserEmail(req: Request, res: Response, next: NextFunction) {
    try {
        const { email } = req.body;
        // input validation
        if (!email) return next(createHttpError(400, "Enter email which you want verify."));

        // check user is exist or not
        const creatorExists = await prisma.user.findFirst({
            where: { email },
        });
        if (creatorExists) return next(createHttpError(400, "User email already exists."));

        const otp = generateOTP();

        // if opt is already exists
        let otpExist = await prisma.otp.findFirst({
            where: {
                email,
            },
        });

        let saveOtpDB;
        if (otpExist?.email) {
            saveOtpDB = await prisma.otp.update({
                where: { id: otpExist.id },
                data: {
                    email,
                    otp,
                },
            });
        } else {
            saveOtpDB = await prisma.otp.create({
                data: {
                    email,
                    otp,
                },
            });
        }

        if (!saveOtpDB) return next(createHttpError(400, "some thing want wrong: try again for email verification."));

        // send verification email
        const emailSendStatus = await sendVerificationEmail(email, otp);

        if (emailSendStatus) {
            res.status(200).json({ message: `Verification code sended on ${email} address.` });
        } else {
            return next(createHttpError(400, "some thing wait wrong: verification email not send."));
        }
    } catch (error) {
        console.log(error);
        return next(createHttpError(400, "some thing wait wrong in user otp send."));
    }
}

export async function sendVerifyCreatorEmail(req: Request, res: Response, next: NextFunction) {
    try {
        const { email } = req.body;
        // input validation
        if (!email) return next(createHttpError(400, "Enter email which you want verify."));

        // check user is exist or not
        const creatorExists = await prisma.creator.findFirst({
            where: { email },
        });
        console.log(creatorExists);
        if (creatorExists) return next(createHttpError(400, "Creator email already exists."));

        const otp = generateOTP();

        // if opt is already exists
        let otpExist = await prisma.otp.findFirst({
            where: {
                email,
            },
        });

        let saveOtpDB;
        if (otpExist?.email) {
            saveOtpDB = await prisma.otp.update({
                where: { id: otpExist.id },
                data: {
                    email,
                    otp,
                },
            });
        } else {
            saveOtpDB = await prisma.otp.create({
                data: {
                    email,
                    otp,
                },
            });
        }

        if (!saveOtpDB) return next(createHttpError(400, "some thing want wrong: try again for email verification."));

        // send verification email
        const emailSendStatus = await sendVerificationEmail(email, otp);

        if (emailSendStatus) {
            res.status(200).json({ email: email, message: `Verification code sended on ${email} address.` });
        } else {
            return next(createHttpError(400, "some thing wait wrong: verification email not send."));
        }
    } catch (error) {
        console.log(error);
        return next(createHttpError(400, "some thing wait wrong in creator otp send."));
    }
}

export async function sendForgotPasswordVerifyCreatorEmail(req: Request, res: Response, next: NextFunction) {
    try {
        const { email } = req.body;
        // input validation
        if (!email) return next(createHttpError(400, "Enter email which you want verify."));

        // check user is exist or not
        const creatorExists = await prisma.creator.findFirst({
            where: { email },
        });
        if (!creatorExists) return next(createHttpError(400, "Creator account don't exists."));

        const otp = generateOTP();

        // if opt is already exists
        let otpExist = await prisma.otp.findFirst({
            where: {
                email,
            },
        });

        let saveOtpDB;
        if (otpExist?.email) {
            saveOtpDB = await prisma.otp.update({
                where: { id: otpExist.id },
                data: {
                    email,
                    otp,
                },
            });
        } else {
            saveOtpDB = await prisma.otp.create({
                data: {
                    email,
                    otp,
                },
            });
        }

        if (!saveOtpDB) return next(createHttpError(400, "some thing want wrong: try again for email verification."));

        // send verification email
        const emailSendStatus = await sendVerificationEmail(email, otp);

        if (emailSendStatus) {
            res.status(200).json({ email: email, message: `Verification code sended on ${email} address.` });
        } else {
            return next(createHttpError(400, "some thing wait wrong: verification email not send."));
        }
    } catch (error) {
        console.log(error);
        return next(createHttpError(400, "some thing wait wrong in creator otp send."));
    }
}

export async function verifyEmailOTP(req: Request, res: Response, next: NextFunction) {
    try {
        const { email, otp } = req.body;
        // input validation
        if (!email || !otp) return next(createHttpError(400, "Enter email and OTP which you want verify."));
        // verify otp
        const verifyStatus = await prisma.otp.findFirst({
            where: {
                email,
                otp: Number(otp),
            },
        });

        if (verifyStatus?.email === email) {
            // delete otp record
            await prisma.otp.delete({
                where: {
                    id: verifyStatus?.id,
                },
            });
            console.log(`${verifyStatus?.email}verified successfully`);
            res.status(200).json({ message: `Email verify successfully.`, email: verifyStatus?.email });
        } else {
            res.status(400).json({ message: `Wrong OTP please try again.` });
        }
    } catch (error) {
        console.log(error);
        return next(createHttpError(400, "some thing wait wrong in creator otp verify."));
    }
}

export async function creatorPasswordForget(req: Request, res: Response, next: NextFunction) {
    try {
        const { email, password } = req.body;
        // input validation
        if (!email || !password)
            return next(createHttpError(400, "Enter email and new password which you want verify."));
        // verify otp

        const profile = await prisma.creator.findFirst({
            where: {
                email,
            },
        });

        if (profile?.id) {
            // hash the password
            const hashedPassword = await hashPassword(password);
            const forgotPassword = await prisma.creator.update({
                where: {
                    id: profile?.id,
                },
                data: {
                    password: hashedPassword,
                },
            });

            console.log("forgotPassword", forgotPassword);

            if (forgotPassword) {
                res.status(200).json({ message: `Password forgot successfully.`, email: forgotPassword?.email });
            } else {
                res.status(400).json({ message: `Some thing want wrong try again.` });
            }
        } else {
            res.status(400).json({ message: `Account not exist using this email address.` });
        }
    } catch (error) {
        console.log(error);
        return next(createHttpError(400, "some thing wait wrong in creator otp verify."));
    }
}
