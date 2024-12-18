import { NextFunction, Response } from "express";
import createHttpError from "http-errors";
import { RequestWithUser } from "../../middlewares/auth.middleware";
import prisma from "../../config/prisma";
import { deleteSingleObjectFromS3 } from "../../services/s3/s3.controller";

type task = {
    resourceId: string;
    lessonId: number;
};
interface ITasks {
    resources: task[];
}

export async function createTasks(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        const { resources } = req.body as ITasks;
        // input validation
        if (resources.length <= 0) return next(createHttpError(400, "Enter all inputs correctly."));

        // Create the tasks in the database
        const newTasks = await prisma.task.createMany({
            data: resources,
        });

        if (!newTasks) return next(createHttpError(400, "some thing want wrong: try again for creating tasks."));
        // const deleteAllLesson = await prisma.lesson.deleteMany();

        res.status(200).json({ message: "Tasks files added successfully.", tasks: newTasks });
    } catch (error: any) {
        console.log(error.message);
        return next(createHttpError(400, "some thing wait wrong in create video."));
    }
}

export async function getLessonTasks(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        let { lessonId } = req.params;

        const verifyLessonId = Number(lessonId);
        // input validation
        if (!lessonId || !verifyLessonId) return next(createHttpError(400, "Enter lesson-id in api url correctly."));

        // Get the video in the database
        const tasks = await prisma.task.findMany({
            where: {
                lessonId: verifyLessonId,
            },
        });

        if (!tasks) return next(createHttpError(400, "some thing want wrong: try again for getting lesson task."));

        res.status(200).json({ tasks });
    } catch (error: any) {
        console.log(error.message);
        return next(createHttpError(400, "some thing wait wrong in getting lesson task."));
    }
}

export async function deleteLessonTask(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        const { bucket, key } = req.body;
        const { taskId } = req.params;

        const verifyTaskId = Number(taskId);
        // Input validation
        if (!bucket || !key || !verifyTaskId) {
            return next(createHttpError(400, "Enter task-id, bucket, and key correctly."));
        }

        // Use a transaction for the database deletion
        await prisma.$transaction(async (prismaClient) => {
            // Delete task from database
            const deletedTask = await prismaClient.task.delete({
                where: {
                    id: verifyTaskId,
                },
            });

            if (!deletedTask) {
                throw createHttpError(400, "Something went wrong while deleting the lesson task.");
            }

            // Attempt to delete the file from S3
            const deleteFromS3 = await deleteSingleObjectFromS3(bucket, key);

            if (!deleteFromS3.success) {
                throw createHttpError(400, deleteFromS3.message);
            }

            // If both succeed, return success
            res.status(200).json({ success: true, deletedTask, message: deleteFromS3.message });
        });
    } catch (error: any) {
        console.error("Transaction failed:", error.message);

        // Return proper error if the transaction fails
        return next(createHttpError(400, error.message || "Something went wrong while deleting the lesson task."));
    }
}
