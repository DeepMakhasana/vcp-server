import express from "express";
import {
    creatorPasswordForget,
    loginCreator,
    loginUser,
    registerCreator,
    registerUser,
    sendForgotPasswordVerifyCreatorEmail,
    sendVerifyCreatorEmail,
    sendVerifyUserEmail,
    verifyEmailOTP,
} from "./auth.controller";

const authRouter = express.Router();

// user auth
authRouter.post("/user/register", registerUser);
authRouter.post("/user/login", loginUser);
// creator auth
authRouter.post("/creator/register", registerCreator);
authRouter.post("/creator/login", loginCreator);
authRouter.post("/creator/reset-password", creatorPasswordForget);
// email otp verification
authRouter.post("/user/send-verify-email", sendVerifyUserEmail);
authRouter.post("/creator/send-verify-email", sendVerifyCreatorEmail);
authRouter.post("/creator/forgot-password/send-verify-email", sendForgotPasswordVerifyCreatorEmail);
authRouter.post("/verify-email-otp", verifyEmailOTP);

export default authRouter;
