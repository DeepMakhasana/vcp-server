import { NextFunction, Response } from "express";
import createHttpError from "http-errors";
import { RequestWithUser } from "../../middlewares/auth.middleware";
import prisma from "../../config/prisma";

// interface IVideo {
//     path: string;
//     lessonId: string;
//     isAssigned: boolean;
// }

export async function getAllCourseModules(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        let { courseId } = req.params;

        const verifyCourseId = Number(courseId);
        // input validation
        if (!courseId || !verifyCourseId) return next(createHttpError(400, "Enter course-id in api url correctly."));

        // Create the course in the database
        const modules = await prisma.module.findMany({
            where: {
                courseId: verifyCourseId,
            },
            include: {
                lessons: {
                    include: {
                        video: true,
                        tasks: true,
                    },
                },
            },
        });

        if (!modules) return next(createHttpError(400, "some thing want wrong: try again for getting all modules."));

        res.status(200).json({ modules });
    } catch (error: any) {
        console.log(error.message);
        return next(createHttpError(400, "some thing wait wrong in getting all modules."));
    }
}
