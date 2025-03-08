import config from "../config";
import { TokenType } from "../auth/types";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

// Create an SES client
const sesClient = new SESClient({
    region: "ap-south-1",
    credentials: {
        accessKeyId: config.sesAccessKey as string,
        secretAccessKey: config.sesSecretAccessKey as string,
    },
});

export const sendVerificationEmail = async (to: string, token: number): Promise<Boolean> => {
    const params = {
        Source: `"Param CAD Center" <${config.email}>`,
        Destination: {
            ToAddresses: [to],
        },
        Message: {
            Subject: { Data: "Your Verification Code" },
            Body: {
                Html: {
                    Data: `
                            <!DOCTYPE html>
                            <html>
                            <head>
                                <meta charset="UTF-8">
                                <meta name="viewport" content="width=device-width, initial-scale=1">
                                <title>Verification Code</title>
                                <style>
                                body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                                .container { max-width: 500px; margin: 20px auto; background: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); text-align: center; }
                                .logo { max-width: 150px; margin-bottom: 20px; }
                                .header { font-size: 20px; font-weight: bold; color: #333; }
                                .code { font-size: 24px; font-weight: bold; color: #0D7284; background: #f3f3f3; display: inline-block; padding: 10px 20px; border-radius: 5px; margin: 10px 0; }
                                .footer { font-size: 12px; color: #777; margin-top: 20px; }
                                </style>
                            </head>
                            <body>
                                <div class="container">
                                <img src="https://vpc-public.s3.ap-south-1.amazonaws.com/Param-Logo.png" alt="param-cad-center" class="logo">
                                <p class="header">Your Verification Code</p>
                                <p>Please use the following code to verify your email address:</p>
                                <p class="code">${token}</p>
                                <p>If you didn’t request this, please ignore this email.</p>
                                <div class="footer">
                                    <p>© 2025 Param CAD Center. All rights reserved.</p>
                                </div>
                                </div>
                            </body>
                            </html>
                        `,
                },
            },
        },
    };

    try {
        const command = new SendEmailCommand(params);
        const response = await sesClient.send(command);
        console.log("Email sent successfully:", response);
        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
};

export const sendPublishRequest = async (domain: string): Promise<Boolean> => {
    const params = {
        Source: `"Param CAD Center" <${config.email}>`,
        Destination: {
            ToAddresses: ["deepmakhasana.dev@gmail.com"],
        },
        Message: {
            Subject: { Data: "Your Verification Code" },
            Body: {
                Html: {
                    Data: `<div>
                            <p>Re build the ${domain}</p>
                            <p>Public new changes</p>
                        </div>`,
                },
            },
        },
    };

    try {
        const command = new SendEmailCommand(params);
        const response = await sesClient.send(command);
        console.log("Email sent successfully:", response);
        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
};

export const sendCourseCompletionRequest = async (
    userDetail: TokenType | undefined,
    courseDetail: any,
    creatorEmail: string | undefined
): Promise<Boolean> => {
    const params = {
        Source: `"Param CAD Center" <${config.email}>`,
        Destination: {
            ToAddresses: [creatorEmail as string],
        },
        Message: {
            Subject: { Data: "Your Verification Code" },
            Body: {
                Html: {
                    Data: `<div>
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
                },
            },
        },
    };

    try {
        const command = new SendEmailCommand(params);
        const response = await sesClient.send(command);
        console.log("Email sent successfully:", response);
        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
};

export const generateOTP = (): number => {
    return Math.floor(100000 + Math.random() * 900000);
};
