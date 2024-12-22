import express from "express";
// import { sendVerificationSMS, verifyVerificationSMSCode } from "./sns.controller";
// import { validate } from "../../middlewares/validator.middleware";
// import { sendSNSVerificationCodeSchema } from "./sns.schema";

const snsRouter = express.Router();

// snsRouter.post("/send-verification-sms", validate(sendSNSVerificationCodeSchema), sendVerificationSMS);
// snsRouter.post("/verify-sms-code", verifyVerificationSMSCode);

export default snsRouter;
