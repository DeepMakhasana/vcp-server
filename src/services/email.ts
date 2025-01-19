import nodemailer from "nodemailer";
import config from "../config";
import { TokenType } from "../auth/types";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: config.email, // Your Gmail address
        pass: config.emailPassword, // The App Password from Google
    },
});

export const sendVerificationEmail = async (to: string, token: number): Promise<Boolean> => {
    const mailOptions = {
        from: '"vcp" <dep7901@gmail.com>',
        to,
        subject: "Email Verification",
        html: `<div>
        <p>Verification code: ${token}</p>
        <p>verify your email.</p>
        </div>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Verification email sent successfully");
        return true;
    } catch (error) {
        console.error("Error sending verification email:", error);
        return false;
    }
};

export const sendPublishRequest = async (domain: string): Promise<Boolean> => {
    const mailOptions = {
        from: '"vcp" <dep7901@gmail.com>',
        to: "deepmakhasana.dev@gmail.com",
        subject: "Rebuild new version",
        html: `<div>
        <p>Re build the ${domain}</p>
        <p>Public new changes</p>
        </div>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Re build mail send successfully.");
        return true;
    } catch (error) {
        console.error("Error sending Re build email:", error);
        return false;
    }
};

export const sendCourseCompletionRequest = async (
    userDetail: TokenType | undefined,
    courseDetail: any,
    creatorEmail: string | undefined
): Promise<Boolean> => {
    console.log("send email--");
    const mailOptions = {
        from: '"vcp" <dep7901@gmail.com>',
        to: creatorEmail as string,
        subject: "Course completion certificate request",
        html: `<div>
        <h2 style="padding-bottom: 1.5rem">Course completion certificate</h2>
        <h3>Purchase detail:</h3>
        <div style="padding: 1rem">
        <p>Id: ${courseDetail?.order_id}</p>
        <p>Purchase Date: ${courseDetail?.createdAt}</p>
        <p>Number: ${courseDetail?.endAt}</p>
        </div>
        <h3>Student detail:</h3>
        <div style="padding: 1rem">
        <p>Name: ${userDetail?.name}</p>
        <p>Email: ${userDetail?.email}</p>
        <p>Number: ${userDetail?.mobile}</p>
        </div>
        <h3>Course detail:</h3>
        <div style="padding: 1rem">
        <p>Title: ${courseDetail?.course.title}</p>
        <p>Duration: ${courseDetail?.course.duration} Day</p>
        </div>
        </div>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Re build mail send successfully.");
        return true;
    } catch (error) {
        console.error("Error sending Re build email:", error);
        return false;
    }
};

export const generateOTP = (): number => {
    return Math.floor(100000 + Math.random() * 900000);
};
