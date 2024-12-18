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
