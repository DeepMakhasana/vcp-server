import { NextFunction, Response } from "express";
import { RequestWithUser } from "../../middlewares/auth.middleware";
import createHttpError from "http-errors";
import {
    DeleteObjectCommand,
    DeleteObjectsCommand,
    DeleteObjectsCommandInput,
    GetObjectCommand,
    ListObjectsV2Command,
    ListObjectsV2CommandInput,
    PutObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";
import config from "../../config";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import path from "path";

const s3Client = new S3Client({
    region: "ap-south-1",
    credentials: {
        accessKeyId: config.s3AccessKey as string,
        secretAccessKey: config.s3SecretAccessKey as string,
    },
});

const generatePresignedUrls = async (
    bucketName: string,
    folderName: string,
    fileNames: Array<string>,
    domain: string
) => {
    return Promise.all(
        fileNames.map(async (fileName) => {
            const key = `videos/${domain}/${folderName}/${fileName}`;
            const command = new PutObjectCommand({
                Bucket: bucketName,
                Key: key,
            });
            const url = await getSignedUrl(s3Client, command, { expiresIn: 18000 }); // 5-hours expiration
            return { fileName, url };
        })
    );
};

export async function putVideoContentS3(req: RequestWithUser, res: Response, next: NextFunction) {
    console.log("putVideoContentS3 run...");
    try {
        const { fileNames, folderName, bucket } = req.body;
        const user = req.user;

        // input validation
        if (!fileNames || !folderName || !bucket || !Array.isArray(fileNames))
            return next(createHttpError(400, "Enter file name and type correctly."));

        const presignedUrls = await generatePresignedUrls(bucket, folderName, fileNames, String(user?.domain));

        res.status(200).json({ presignedUrls });
    } catch (error) {
        console.log(error);
        return next(createHttpError(400, "some thing wait wrong in s3 getObject presigned url."));
    }
}

export async function putObjectFromS3(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        const { fileName, fileType, bucket } = req.body;
        // input validation
        if (!fileName || !fileType) return next(createHttpError(400, "Enter file name and type correctly."));

        const command = new PutObjectCommand({
            Bucket: bucket,
            Key: `course/cover-image/${fileName}`,
            ContentType: fileType,
        });

        const putObjetUrl = await getSignedUrl(s3Client, command);

        res.status(200).json({ url: putObjetUrl });
    } catch (error) {
        console.log(error);
        return next(createHttpError(400, "some thing wait wrong in s3 getObject presigned url."));
    }
}

export async function putObjectPresignedUrl(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        const { fileName, fileType, bucket } = req.body;
        // input validation
        if (!fileName || !fileType) return next(createHttpError(400, "Enter file name and type correctly."));

        const command = new PutObjectCommand({
            Bucket: bucket,
            Key: fileName,
            ContentType: fileType,
        });

        const putObjetUrl = await getSignedUrl(s3Client, command);

        res.status(200).json({ url: putObjetUrl });
    } catch (error) {
        console.log(error);
        return next(createHttpError(400, "some thing wait wrong in s3 putObjectPresignedUrl presigned url."));
    }
}

export async function getObjectFromS3(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        const { key, bucket } = req.body;
        console.log(key, bucket);
        // input validation
        if (!key) return next(createHttpError(400, "Enter file path (key) correctly."));

        const command = new GetObjectCommand({
            Bucket: bucket,
            Key: key,
        });

        const getObjetUrl = await getSignedUrl(s3Client, command);

        res.status(200).json({ url: getObjetUrl });
    } catch (error) {
        console.log(error);
        return next(createHttpError(400, "some thing wait wrong in s3 getObject presigned url."));
    }
}

type fileType = {
    fileName: string;
    key: string;
};
const generateMultiplePresignedUrls = async (bucket: string, keys: Array<fileType>) => {
    return Promise.all(
        keys.map(async (key) => {
            const command = new PutObjectCommand({
                Bucket: bucket,
                Key: key.key,
            });
            const url = await getSignedUrl(s3Client, command, { expiresIn: 18000 }); // 5-hours expiration
            return { fileName: key.fileName, url };
        })
    );
};

interface IPutMultipleObject {
    files: fileType[];
    bucket: string;
}

export async function putMultipleObjectToS3(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        const { files, bucket } = req.body as IPutMultipleObject;
        // input validation
        if (!files || !bucket) return next(createHttpError(400, "Enter file name and type correctly."));

        const presignedUrls = await generateMultiplePresignedUrls(bucket, files);

        res.status(200).json({ presignedUrls });
    } catch (error) {
        console.log(error);
        return next(createHttpError(400, "some thing wait wrong in s3 getObject presigned url."));
    }
}

async function deleteFolder(bucketName: string, folderPath: string) {
    try {
        let continuationToken: string | undefined = undefined;

        do {
            // Step 1: List objects in the folder
            const listParams: ListObjectsV2CommandInput = {
                Bucket: bucketName,
                Prefix: folderPath, // Ensure folderPath ends with '/'
                ContinuationToken: continuationToken, // For paginated results
            };

            const listCommand = new ListObjectsV2Command(listParams);
            const listResponse = await s3Client.send(listCommand);

            if (!listResponse.Contents || listResponse.Contents.length === 0) {
                console.log("No objects found in the folder.");
                break;
            }

            // Step 2: Prepare objects for deletion
            const objectsToDelete = listResponse.Contents.map((object) => ({
                Key: object.Key!,
            }));

            const deleteParams: DeleteObjectsCommandInput = {
                Bucket: bucketName,
                Delete: {
                    Objects: objectsToDelete,
                },
            };

            // Step 3: Send delete command
            const deleteCommand = new DeleteObjectsCommand(deleteParams);
            const deleteResponse = await s3Client.send(deleteCommand);

            console.log("Deleted objects:", deleteResponse.Deleted);

            // Step 4: Handle pagination
            continuationToken = listResponse.NextContinuationToken;
        } while (continuationToken);

        console.log(`Successfully deleted all objects in folder: ${folderPath}`);
        return true;
    } catch (error) {
        console.error("Error deleting folder:", (error as Error).message);
        return false;
    }
}

export async function deleteObjectsFromS3(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        const { folderPath, bucket } = req.body;
        console.log(folderPath, bucket);
        // input validation
        if (!folderPath || !bucket) return next(createHttpError(400, "Enter file name and bucket correctly."));

        const deleted = await deleteFolder(bucket, folderPath);

        if (!deleted) return next(createHttpError(400, "Some thing want wrong in deleting video."));

        res.status(200).json({ deleted });
    } catch (error) {
        console.log(error);
        return next(createHttpError(400, "some thing wait wrong in s3 deleteObject when deleting video."));
    }
}

export async function deleteSingleObjectFromS3(
    bucketName: string,
    key: string,
    maxRetries: number = 3,
    delay: number = 1000 // Delay between retries in milliseconds
): Promise<{ success: boolean; message: string }> {
    let attempt = 0;

    while (attempt < maxRetries) {
        try {
            const deleteParams = {
                Bucket: bucketName,
                Key: key,
            };

            const command = new DeleteObjectCommand(deleteParams);
            await s3Client.send(command);

            return { success: true, message: `File ${key.split(".")[1].split("/")[1]} deleted successfully.` };
        } catch (error) {
            attempt++;
            console.error(`Attempt ${attempt} failed for ${key}:`, error);

            if (attempt >= maxRetries) {
                // Exhausted retries, return failure response
                return { success: false, message: `Error: Failed to delete file ${key} after ${maxRetries} attempts.` };
            }

            // Wait for a delay before retrying
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }

    // This point should not be reached, but included as a fallback
    return { success: false, message: `Unexpected error: Unable to delete file ${key}.` };
}
