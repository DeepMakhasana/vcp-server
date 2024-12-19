import express from "express";
import cors from "cors";
import helmet from "helmet";

import globalErrorHandel from "./error";
import config from "./config";
import authRouter from "./auth/auth.routes";
import courseRouter from "./dashboard/course/course.routes";
import s3Router from "./services/s3/s3.routes";

const app = express();

// Middleware
const allowedOrigins: string[] = [
    config.frontendBaseUrl as string,
    config.creatorFrontendBaseUrl as string,
    "http://localhost:4173",
    "http://127.0.0.1",
    "http://0.0.0.0",
];
const corsOptions = {
    origin: (origin: string | undefined, cb: (err: Error | null, allow?: boolean) => void) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin || allowedOrigins.includes(origin)) {
            cb(null, true);
        } else {
            cb(new Error("Not allowed by CORS"));
        }
    }, // Only allow requests from this origin
    optionsSuccessStatus: 200, // Some legacy browsers choke on 204
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed methods
};
app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/api", (req, res, next) => {
    res.json({ message: "Welcome to Video course platform API.", headers: req.headers });
});

app.get("/api/health", (req, res, next) => {
    res.json({ message: "Good health of Video course platform API.", status: "Ok" });
});

// use root routes
app.use("/api/auth", authRouter);
app.use("/api/course", courseRouter);
app.use("/api/s3", s3Router);

// Global error handler
app.use(globalErrorHandel);

export default app;
