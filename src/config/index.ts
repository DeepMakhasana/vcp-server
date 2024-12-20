import dotenv from "dotenv";
dotenv.config();

const _config = {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV,
    frontendBaseUrl: process.env.FRONT_END_URL,
    creatorFrontendBaseUrl: process.env.CREATOR_FRONT_END_URL,
    databaseURL: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET,
    email: process.env.EMAIL_ADDRESS,
    emailPassword: process.env.EMAIL_PASSWORD,
    s3AccessKey: process.env.S3_ACCESS_KEY,
    s3SecretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
};

const config = Object.freeze(_config);

export default config;
