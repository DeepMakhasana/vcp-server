import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import prisma from "../config/prisma";
import { hashPassword, verifyPassword } from "../utils/bcrypt";
import { generateToken } from "../utils/jwt";
import { generateOTP, sendVerificationEmail } from "../services/email";
import { CreatorRegisterParameters, ILoginParameter, UserRegisterParameters } from "./types";
import { RequestWithUser } from "../middlewares/auth.middleware";

const isEmailVerified = async (email: string) => {
    return await prisma.verifiedEmail.findFirst({
        where: {
            email,
        },
    });
};

export async function registerUser(req: Request, res: Response, next: NextFunction) {
    try {
        const { name, email, password, mobile, creatorId } = req.body as UserRegisterParameters;

        // check user is exist or not
        const userExists = await prisma.user.findFirst({
            where: { OR: [{ email }, { mobile }] },
        });
        if (userExists) return next(createHttpError(400, "User already exists with this email or mobile number."));

        // hash the password
        const hashedPassword = await hashPassword(password);

        // check user email verification status
        const isVerified = await isEmailVerified(email);
        console.log(isVerified, email);
        if (!isVerified?.email) return next(createHttpError(400, "Verify email using verification code."));

        // insert user in database
        const createNewUser = await prisma.user.create({
            data: {
                name,
                email,
                mobile,
                password: hashedPassword,
                isLogin: true,
                creatorId,
            },
        });

        if (!createNewUser?.email)
            return next(createHttpError(400, "An error occurred. Please try registering again."));

        // Remove the password property
        Reflect.deleteProperty(createNewUser, "password");
        Reflect.deleteProperty(createNewUser, "isLogin");
        // generate the token
        const token = generateToken(createNewUser, ["student"]);
        res.status(200).json({ message: "Register successfully.", token });
    } catch (error: any) {
        console.log(error.message);
        return next(createHttpError(400, "some thing wait wrong in user register."));
    }
}

export async function loginUser(req: Request, res: Response, next: NextFunction) {
    try {
        const { email, password } = req.body as ILoginParameter;

        // check user is exist or not
        const userExists = await prisma.user.findFirst({
            where: { email },
        });
        if (!userExists) return next(createHttpError(400, "User account doesn't exists"));

        if (userExists.isLogin) return next(createHttpError(400, "User already login."));

        // password check
        const hashedPassword = userExists.password;
        const machPassword = await verifyPassword(password, hashedPassword);

        if (!machPassword) return next(createHttpError(400, "Incorrect password"));

        // Remove the password property
        Reflect.deleteProperty(userExists, "password");
        Reflect.deleteProperty(userExists, "isLogin");
        // generate the token
        const token = generateToken(userExists, ["student"]);
        res.status(200).json({ message: "Login successfully", token });
    } catch (error: any) {
        console.log(error.message);
        return next(createHttpError(400, "some thing wait wrong in user register."));
    }
}

export async function logoutUser(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        const userId = req?.user?.id;
        await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                isLogin: false,
            },
        });
        res.status(200).json({ message: "Logout successfully" });
    } catch (error: any) {
        console.log(error.message);
        return next(createHttpError(400, "some thing wait wrong in user register."));
    }
}

export async function getCreatorUsers(req: Request, res: Response, next: NextFunction) {
    try {
        const { creatorId } = req.params;
        // Validate lesson ID
        const verifyId = Number(creatorId);
        if (!verifyId) return next(createHttpError(400, "creator-id not able to get."));

        // check user is exist or not
        const users = await prisma.user.findMany({
            where: {
                creatorId: verifyId,
            },
            select: {
                id: true,
                name: true,
                email: true,
                mobile: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        res.status(200).json(users);
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
        const createNewCreator = await prisma.creator.create({
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
        Reflect.deleteProperty(createNewCreator, "bio");
        Reflect.deleteProperty(createNewCreator, "role");
        // generate the token
        const token = generateToken(createNewCreator, ["student", "creator"]);
        res.status(200).json({ message: "Register successfully.", token });
    } catch (error: any) {
        console.log(error.message);
        return next(createHttpError(400, "some thing wait wrong in user register."));
    }
}

export async function loginCreator(req: Request, res: Response, next: NextFunction) {
    try {
        const { email, password } = req.body as ILoginParameter;
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
        Reflect.deleteProperty(creatorExists, "bio");
        Reflect.deleteProperty(creatorExists, "role");
        // generate the token
        const token = generateToken(creatorExists, ["student", "creator"]);
        res.status(200).json({ user: creatorExists, message: "Login successfully.", token });
    } catch (error: any) {
        console.log(error.message);
        return next(createHttpError(400, "some thing wait wrong in user register."));
    }
}

export async function sendVerifyUserEmail(req: Request, res: Response, next: NextFunction) {
    try {
        const { email } = req.body;

        // check user is exist or not
        const creatorExists = await prisma.user.findFirst({
            where: { email },
        });
        if (creatorExists) return next(createHttpError(400, "User email already exists."));

        // check email is already verified or not
        const isAlreadyVerify = await prisma.verifiedEmail.findFirst({
            where: { email },
        });
        if (isAlreadyVerify?.email) {
            res.status(200).json({ email: email, message: `Email address already Verified.` });
            return;
        }

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
        return next(createHttpError(400, "some thing wait wrong in user otp send."));
    }
}

export async function sendVerifyCreatorEmail(req: Request, res: Response, next: NextFunction) {
    try {
        const { email } = req.body;

        // check user is exist or not
        const creatorExists = await prisma.creator.findFirst({
            where: { email },
        });
        if (creatorExists) return next(createHttpError(400, "Creator email already exists."));

        // check email is already verified or not
        const isAlreadyVerify = await prisma.verifiedEmail.findFirst({
            where: { email },
        });
        if (isAlreadyVerify?.email) {
            res.status(200).json({ email: email, message: `Email address already Verified.` });
            return;
        }

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

        await prisma.$transaction(async (prismaTransaction) => {
            // Retrieve the OTP from the database
            const verifyOtp = await prismaTransaction.otp.findFirst({
                where: {
                    email,
                },
            });

            // Check if the OTP matches
            if (!verifyOtp || verifyOtp.otp !== Number(otp)) {
                return next(createHttpError(400, "Wrong verification code (OTP)."));
            }

            // Delete the used OTP
            await prismaTransaction.otp.delete({
                where: {
                    id: verifyOtp.id,
                },
            });
        });

        // If the transaction succeeds, send a success response
        res.status(200).json({ message: "Email verification successfully" });
    } catch (error) {
        console.log(error);
        return next(error);
    }
}

export async function verifyRegisterOTP(req: Request, res: Response, next: NextFunction) {
    try {
        const { email, otp } = req.body;

        await prisma.$transaction(async (prismaTransaction) => {
            // Retrieve the OTP from the database
            const verifyOtp = await prismaTransaction.otp.findFirst({
                where: {
                    email,
                },
            });

            // Check if the OTP matches
            if (!verifyOtp || verifyOtp.otp !== Number(otp)) {
                return next(createHttpError(400, "Wrong verification code (OTP)."));
            }

            await prismaTransaction.verifiedEmail.create({
                data: {
                    email: verifyOtp.email,
                },
            });

            // Delete the used OTP
            await prismaTransaction.otp.delete({
                where: {
                    id: verifyOtp.id,
                },
            });
        });

        // If the transaction succeeds, send a success response
        res.status(200).json({ message: "Email verification successfully" });
    } catch (error) {
        console.log(error);
        return next(error);
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
