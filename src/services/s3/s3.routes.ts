import express from "express";
import {
    deleteObjectsFromS3,
    getObjectFromS3,
    putMultipleObjectToS3,
    putObjectFromS3,
    putVideoContentS3,
} from "./s3.controller";
const s3Router = express.Router();

s3Router.post("/putObject", putObjectFromS3);
s3Router.post("/getObject", getObjectFromS3);
s3Router.post("/putVideoObjects", putVideoContentS3);
s3Router.post("/putMultipleObjects", putMultipleObjectToS3);
s3Router.delete("/deleteObjects", deleteObjectsFromS3);

export default s3Router;
