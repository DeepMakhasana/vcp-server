import express from "express";
import {
    deleteObjectsFromS3,
    getObjectFromS3,
    putMultipleObjectToS3,
    putObjectFromS3,
    putObjectPresignedUrl,
    putVideoContentS3,
} from "./s3.controller";
import { authenticationMiddleware } from "../../middlewares/auth.middleware";
const s3Router = express.Router();

s3Router.post("/putObject", putObjectFromS3);
s3Router.post("/putObjectPresignedUrl", authenticationMiddleware(["creator"]), putObjectPresignedUrl);
s3Router.post("/getObject", authenticationMiddleware(["creator"]), getObjectFromS3);
s3Router.post("/putMultipleObjects", authenticationMiddleware(["creator"]), putMultipleObjectToS3);
s3Router.delete("/deleteObjects", authenticationMiddleware(["creator"]), deleteObjectsFromS3);

s3Router.post("/putVideoObjects", authenticationMiddleware(["creator"]), putVideoContentS3);

export default s3Router;
