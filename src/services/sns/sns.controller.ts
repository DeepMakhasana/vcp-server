// import { NextFunction, Request, Response } from "express";
// import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";
// import createHttpError from "http-errors";
// import config from "../../config";
// import { generateOTP } from "../email";
// import prisma from "../../config/prisma";

// const snsClient = new SNSClient({
//     region: config.awsRegion,
//     credentials: {
//         accessKeyId: config.snsAccessKey as string,
//         secretAccessKey: config.snsSecretAccessKey as string,
//     },
// });

// async function sendSMS(message: string, number: string, maxRetries: number = 3) {
//     const phoneNumber = `+91${number}`;
//     let attempts = 0;

//     while (attempts < maxRetries) {
//         attempts++;

//         try {
//             // Create the SNS PublishCommand
//             const publishCommand = new PublishCommand({
//                 Message: message,
//                 PhoneNumber: phoneNumber,
//                 MessageAttributes: {
//                     "AWS.SNS.SMS.SenderID": {
//                         DataType: "String",
//                         StringValue: "some thing",
//                     },
//                 },
//             });

//             // Send the message
//             const response = await snsClient.send(publishCommand);

//             console.log(response);

//             // Check if the HTTPStatusCode is 200
//             if (response.$metadata.httpStatusCode === 200) {
//                 return { success: true, message: `Verification code sent successfully on ${number}` }; // Exit the function if successful
//             }

//             console.warn(`Attempt ${attempts}: Failed with status code ${response.$metadata.httpStatusCode}`);
//         } catch (error) {
//             console.error(`Attempt ${attempts}: Error sending message`, error);
//         }

//         // Wait before retrying (optional: add exponential backoff)
//         if (attempts < maxRetries) {
//             console.log("Retrying...");
//             await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
//         }
//     }

//     return { success: false, message: `Unable to send code on ${number}` };
// }

// export async function sendVerificationSMS(req: Request, res: Response, next: NextFunction) {
//     try {
//         const { mobile } = req.body;

//         const otp = generateOTP();
//         const message = `Your verification code is ${otp}`;

//         const transactionResult = await prisma.$transaction(async (prismaTransaction) => {
//             // Add OTP to the database
//             await prismaTransaction.numberVerificationOtp.create({
//                 data: {
//                     mobile,
//                     otp,
//                 },
//             });

//             // Send SMS
//             const sendSMSToUser = await sendSMS(message, mobile);
//             if (!sendSMSToUser.success) {
//                 throw new Error(sendSMSToUser.message); // This will trigger a rollback
//             }

//             return sendSMSToUser.message; // Return the success message
//         });

//         // If we reach here, the transaction was successful
//         res.status(200).json({ message: transactionResult });
//     } catch (error) {
//         console.error(error);
//         return next(createHttpError(400, "some thing wait wrong in SNS send verification code."));
//     }
// }

// export async function verifyVerificationSMSCode(req: Request, res: Response, next: NextFunction) {
//     try {
//         const { mobile, otp } = req.body;

//         await prisma.$transaction(async (prismaTransaction) => {
//             // Retrieve the OTP from the database
//             const verifySMSOtp = await prismaTransaction.numberVerificationOtp.findFirst({
//                 where: {
//                     mobile,
//                 },
//             });

//             // Check if the OTP matches
//             if (!verifySMSOtp || verifySMSOtp.otp !== Number(otp)) {
//                 throw new Error("Wrong verification code (OTP).");
//             }

//             // Add the mobile number to the verified table
//             await prismaTransaction.verifiedMobileNumber.create({
//                 data: {
//                     mobile,
//                 },
//             });

//             // Delete the used OTP
//             await prismaTransaction.numberVerificationOtp.delete({
//                 where: {
//                     id: verifySMSOtp.id,
//                 },
//             });
//         });

//         // If the transaction succeeds, send a success response
//         res.status(200).json({ message: "OTP verification successful" });
//     } catch (error) {
//         console.error(error);

//         // Check if the error is related to OTP mismatch
//         if (error instanceof Error && error.message === "Wrong verification code (OTP).") {
//             return next(createHttpError(400, error.message));
//         }

//         // Handle other errors
//         return next(createHttpError(400, "Something went wrong during OTP verification."));
//     }
// }
