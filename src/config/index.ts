import dotenv from "dotenv";
dotenv.config();

const _config = {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV,
    frontendBaseUrl: process.env.FRONT_END_URL,
    creatorFrontendBaseUrl: process.env.CREATOR_FRONT_END_URL,
    learnFrontendBaseUrl: process.env.LEARN_FRONT_END_URL,
    databaseURL: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET,
    email: process.env.EMAIL_ADDRESS,
    sesAccessKey: process.env.SES_ACCESS_KEY,
    sesSecretAccessKey: process.env.SES_SECRET_ACCESS_KEY,
    s3AccessKey: process.env.AWS_S3_ACCESS_KEY,
    s3SecretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
    awsRegion: process.env.AWS_REGION,
    snsAccessKey: process.env.AWS_SNS_ACCESS_KEY,
    snsSecretAccessKey: process.env.AWS_SNS_SECRET_ACCESS_KEY,
    razorpayKeyId: process.env.RAZORPAY_KEY_ID as string,
    razorpayKeySecret: process.env.RAZORPAY_SECRET as string,
};

const config = Object.freeze(_config);

export default config;
