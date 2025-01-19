import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import prisma from "../../config/prisma";
import { RequestWithUser } from "../../middlewares/auth.middleware";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import config from "../../config";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
    region: "ap-south-1",
    credentials: {
        accessKeyId: config.s3AccessKey as string,
        secretAccessKey: config.s3SecretAccessKey as string,
    },
});

export async function getLearnCourseBySlug(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        const { slug, purchaseId } = req.params;

        console.log("execute - learn course");

        // input validation
        if (!purchaseId) return next(createHttpError(400, "Enter purchase-id in api url correctly."));

        const purchase = await prisma.purchase.findUnique({
            where: {
                order_id: purchaseId,
            },
        });

        if (purchase?.userId != req.user?.id || purchase?.status != "SUCCESS") {
            return next(createHttpError(403, "Unauthorized access."));
        }

        // Get all the courses of creator in the database
        const course = await prisma.course.findUnique({
            where: {
                slug,
            },
            select: {
                id: true,
                title: true,
                image: true,
                duration: true,
                modules: {
                    include: {
                        lessons: {
                            include: {
                                video: {
                                    select: {
                                        lessonId: true,
                                    },
                                },
                                tasks: {
                                    select: {
                                        lessonId: true,
                                    },
                                },
                                public: {
                                    select: {
                                        url: true,
                                    },
                                },
                                progresses: {
                                    where: {
                                        purchaseId,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        res.status(200).json(course);
    } catch (error: any) {
        console.log(error.message);
        return next(error);
    }
}

export async function createVideoPresignedUrl(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        const { purchaseId, lessonId } = req.params;
        console.log("execute - video");

        // const verifyPurchaseId = Number(purchaseId);
        const verifyLessonId = Number(lessonId);
        // input validation
        if (!purchaseId || !verifyLessonId) return next(createHttpError(400, "enter valid id."));

        // Fetch purchase and validate ownership
        const purchase = await prisma.purchase.findUnique({
            where: {
                order_id: purchaseId,
            },
            select: {
                userId: true,
            },
        });

        if (!purchase || purchase.userId != req.user?.id) {
            return next(createHttpError(403, "Unauthorized access."));
        }

        // Fetch video and validate existence
        const video = await prisma.video.findUnique({
            where: {
                lessonId: verifyLessonId,
            },
            select: {
                resourceId: true,
            },
        });

        if (!video) return next(createHttpError(404, "No video resource."));

        // Generate presigned URL
        const key = `videos/${video?.resourceId}/master.m3u8`;
        const command = new GetObjectCommand({
            Bucket: "vcp-private",
            Key: key,
        });

        const getObjetUrl = await getSignedUrl(s3Client, command, { expiresIn: 30 }); // 5-hours expiration

        res.status(200).json({ url: getObjetUrl });
    } catch (error) {
        return next(error);
    }
}

type fileType = {
    fileName: string;
    key: string;
};
const generateMultiplePresignedUrls = async (bucket: string, keys: Array<fileType>) => {
    return Promise.all(
        keys.map(async (key) => {
            const command = new GetObjectCommand({
                Bucket: bucket,
                Key: key.key,
            });
            const url = await getSignedUrl(s3Client, command, { expiresIn: 18000 }); // 5-hours expiration
            return { fileName: key.fileName, url };
        })
    );
};

export async function createTaskPresignedUrl(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        const { purchaseId, lessonId } = req.params;

        console.log("execute - task");

        // const verifyPurchaseId = Number(purchaseId);
        const verifyLessonId = Number(lessonId);
        // input validation
        if (!purchaseId || !verifyLessonId) return next(createHttpError(400, "enter valid id."));

        // Fetch purchase and validate ownership
        const purchase = await prisma.purchase.findUnique({
            where: {
                order_id: purchaseId,
            },
            select: {
                userId: true,
            },
        });

        if (!purchase || purchase.userId != req.user?.id) {
            return next(createHttpError(403, "Unauthorized access."));
        }

        // Fetch video and validate existence
        const tasks = await prisma.task.findMany({
            where: {
                lessonId: verifyLessonId,
            },
            select: {
                id: true,
                resourceId: true,
            },
        });

        if (tasks.length == 0) return next(createHttpError(404, "No task resource."));

        // Generate presigned URL
        const keys = tasks.map((task) => {
            const splitfileName = task.resourceId.split("/");
            const fileName = splitfileName[1].split(".").shift() as string;
            return {
                fileName,
                key: `task/${task.resourceId}`,
            };
        });
        const urls = await generateMultiplePresignedUrls("vcp-private", keys);

        res.status(200).json(urls);
    } catch (error) {
        return next(error);
    }
}

export async function courseProgress(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        const { purchaseId, courseId } = req.params;

        console.log("execute - progress percentage");

        // const verifyPurchaseId = Number(purchaseId);
        const verifyCourseId = Number(courseId);
        // input validation
        if (!purchaseId || !verifyCourseId) return next(createHttpError(400, "enter valid id."));

        // Count total lessons in the course
        const totalLessons = await prisma.lesson.count({
            where: {
                module: {
                    courseId: verifyCourseId,
                },
            },
        });

        // Count completed lessons for the purchase
        const completedLessons = await prisma.progress.count({
            where: {
                purchaseId: purchaseId,
            },
        });

        const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

        res.status(200).json({ progressPercentage: Math.round(progressPercentage) });
    } catch (error) {
        return next(error);
    }
}
