import express from "express";
import {
    creatorPasswordForget,
    getCreatorUsers,
    loginCreator,
    loginUser,
    logoutUser,
    registerCreator,
    registerUser,
    sendForgotPasswordVerifyCreatorEmail,
    sendVerifyCreatorEmail,
    sendVerifyUserEmail,
    verifyEmailOTP,
    verifyRegisterOTP,
} from "./auth.controller";
import { validate } from "../middlewares/validator.middleware";
import {
    creatorRegisterSchema,
    loginSchema,
    sendEmailOtpSchema,
    userRegisterSchema,
    verifyEmailOtpSchema,
} from "./auth.schema";
import { authenticationMiddleware } from "../middlewares/auth.middleware";

const authRouter = express.Router();

// user auth
authRouter.post("/user/register", validate(userRegisterSchema), registerUser);
authRouter.post("/user/login", validate(loginSchema), loginUser);
authRouter.post("/user/logout", authenticationMiddleware(["student"]), logoutUser);
authRouter.get("/user/:creatorId", getCreatorUsers);
// creator auth
authRouter.post("/creator/register", validate(creatorRegisterSchema), registerCreator);
authRouter.post("/creator/login", validate(loginSchema), loginCreator);
authRouter.post("/creator/reset-password", validate(loginSchema), creatorPasswordForget);
// email otp verification
authRouter.post("/user/send-verify-email", validate(sendEmailOtpSchema), sendVerifyUserEmail);
authRouter.post("/creator/send-verify-email", validate(sendEmailOtpSchema), sendVerifyCreatorEmail);
authRouter.post(
    "/creator/forgot-password/send-verify-email",
    validate(sendEmailOtpSchema),
    sendForgotPasswordVerifyCreatorEmail
);
authRouter.post("/verify-email-otp", validate(verifyEmailOtpSchema), verifyEmailOTP);
authRouter.post("/verify-register-otp", validate(verifyEmailOtpSchema), verifyRegisterOTP);

export default authRouter;
