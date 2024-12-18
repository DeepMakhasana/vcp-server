import { NextFunction, Response } from "express";
import createHttpError from "http-errors";
import { RequestWithUser } from "../../middlewares/auth.middleware";
import prisma from "../../config/prisma";

interface IVideo {
    resourceId: string;
    lessonId: string | number;
}

export async function createVideo(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        const { resourceId, lessonId } = req.body as IVideo;
        // input validation
        if (!resourceId || !lessonId) return next(createHttpError(400, "Enter all inputs correctly."));

        // Create the course in the database
        const newVideo = await prisma.video.create({
            data: {
                resourceId,
                lessonId: Number(lessonId),
            },
        });

        if (!newVideo) return next(createHttpError(400, "some thing want wrong: try again for creating video."));

        res.status(200).json({ message: "Video added successfully.", video: newVideo });
    } catch (error: any) {
        console.log(error.message);
        return next(createHttpError(400, "some thing wait wrong in create video."));
    }
}

export async function getLessonVideo(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        let { lessonId } = req.params;

        const verifyLessonId = Number(lessonId);
        // input validation
        if (!lessonId || !verifyLessonId) return next(createHttpError(400, "Enter lesson-id in api url correctly."));

        // Get the video in the database
        const video = await prisma.video.findUnique({
            where: {
                lessonId: verifyLessonId,
            },
        });

        if (!video) return next(createHttpError(400, "some thing want wrong: try again for getting lesson video."));

        res.status(200).json({ video });
    } catch (error: any) {
        console.log(error.message);
        return next(createHttpError(400, "some thing wait wrong in getting lesson video."));
    }
}

export async function deleteLessonVideo(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        let { lessonId } = req.params;

        const verifyLessonId = Number(lessonId);
        // input validation
        if (!lessonId || !verifyLessonId) return next(createHttpError(400, "Enter lesson-id in api url correctly."));

        // Get the video in the database
        const deletedVideo = await prisma.video.delete({
            where: {
                lessonId: verifyLessonId,
            },
        });

        if (!deletedVideo)
            return next(createHttpError(400, "some thing want wrong: try again for deleting lesson video."));

        res.status(200).json({ deletedVideo });
    } catch (error: any) {
        console.log(error.message);
        return next(createHttpError(400, "some thing wait wrong in deleting lesson video."));
    }
}
