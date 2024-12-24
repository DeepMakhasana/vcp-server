import { NextFunction, Response } from "express";
import createHttpError from "http-errors";
import { RequestWithUser } from "../../middlewares/auth.middleware";
import prisma from "../../config/prisma";

// interface IVideo {
//     path: string;
//     lessonId: string;
//     isAssigned: boolean;
// }

export async function getAllModuleLessons(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        let { moduleId } = req.params;

        const verifyModuleId = Number(moduleId);
        // input validation
        if (!moduleId || !verifyModuleId) return next(createHttpError(400, "Enter module-id in api url correctly."));

        // Get the lessons in the database
        const lessons = await prisma.lesson.findMany({
            where: {
                moduleId: verifyModuleId,
            },
        });

        if (!lessons) return next(createHttpError(400, "some thing want wrong: try again for getting all lessons."));

        res.status(200).json({ lessons });
    } catch (error: any) {
        console.log(error.message);
        return next(createHttpError(400, "some thing wait wrong in getting all lessons."));
    }
}

export async function getLessonById(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        let { lessonId } = req.params;

        const verifyLessonId = Number(lessonId);
        // input validation
        if (!lessonId || !verifyLessonId) return next(createHttpError(400, "Enter lesson-id in api url correctly."));

        // Get the lessons in the database
        const lesson = await prisma.lesson.findUnique({
            where: {
                id: verifyLessonId,
            },
        });

        if (!lesson) return next(createHttpError(400, "some thing want wrong: try again for getting all lessons."));

        res.status(200).json({ lesson });
    } catch (error: any) {
        console.log(error.message);
        return next(createHttpError(400, "some thing wait wrong in getting all lessons."));
    }
}

export async function createLesson(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        const { title, moduleId, isVideo } = req.body;

        // Create the course in the database
        const lesson = await prisma.lesson.create({
            data: {
                title,
                moduleId,
                isVideo,
            },
        });

        if (!lesson) return next(createHttpError(400, "some thing want wrong: try again for creating lesson."));

        res.status(200).json({ message: "Lesson created successfully.", lesson });
    } catch (error: any) {
        console.log(error.message);
        return next(createHttpError(400, "some thing wait wrong in create lesson."));
    }
}

export async function updateLesson(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        const { title, isVideo } = req.body;
        const { id } = req.params;

        const verifyId = Number(id);
        // input validation
        if (!id || !verifyId) return next(createHttpError(400, "Enter lesson-id in api url correctly."));

        // Create the course in the database
        const lesson = await prisma.lesson.update({
            where: {
                id: verifyId,
            },
            data: {
                title,
                isVideo,
            },
        });

        if (!lesson) return next(createHttpError(400, "some thing want wrong: try again for updating lesson."));

        res.status(200).json({ message: "Lesson updated successfully.", lesson });
    } catch (error: any) {
        console.log(error.message);
        return next(createHttpError(400, "some thing wait wrong in update lesson."));
    }
}

export async function deleteLesson(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;

        const verifyId = Number(id);
        // input validation
        if (!id || !verifyId) return next(createHttpError(400, "Enter lesson-id in api url correctly."));

        // Create the course in the database
        const lesson = await prisma.lesson.delete({
            where: {
                id: verifyId,
            },
        });

        if (!lesson) return next(createHttpError(400, "some thing want wrong: try again for deleting lesson."));

        res.status(200).json({ message: "Lesson delete successfully.", lesson });
    } catch (error: any) {
        console.log(error.message);
        return next(error);
    }
}
