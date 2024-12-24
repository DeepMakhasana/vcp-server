import { NextFunction, Response } from "express";
import createHttpError from "http-errors";
import { RequestWithUser } from "../../middlewares/auth.middleware";
import prisma from "../../config/prisma";

// interface IVideo {
//     path: string;
//     lessonId: string;
//     isAssigned: boolean;
// }

export async function createModule(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        const { title, courseId } = req.body;

        // Create the course in the database
        const module = await prisma.module.create({
            data: {
                title,
                courseId,
            },
        });

        if (!module) return next(createHttpError(400, "some thing want wrong: try again for creating module."));

        res.status(200).json({ message: "Module created successfully.", module });
    } catch (error: any) {
        console.log(error.message);
        return next(createHttpError(400, "some thing wait wrong in create module."));
    }
}

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
            orderBy: {
                id: "asc",
            },
        });

        if (!modules) return next(createHttpError(400, "some thing want wrong: try again for getting all modules."));

        res.status(200).json({ modules });
    } catch (error: any) {
        console.log(error.message);
        return next(createHttpError(400, "some thing wait wrong in getting all modules."));
    }
}

export async function updateModule(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        const { title } = req.body;
        const { id } = req.params;

        const verifyId = Number(id);
        // input validation
        if (!id || !verifyId) return next(createHttpError(400, "Enter model-id in api url correctly."));

        // Create the course in the database
        const module = await prisma.module.update({
            where: {
                id: verifyId,
            },
            data: {
                title,
            },
        });

        if (!module) return next(createHttpError(400, "some thing want wrong: try again for updating module."));

        res.status(200).json({ message: "Module updated successfully.", module });
    } catch (error: any) {
        console.log(error.message);
        return next(createHttpError(400, "some thing wait wrong in update module."));
    }
}

export async function updateModulePublishStatus(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        const { status } = req.body;
        const { id } = req.params;

        const verifyId = Number(id);
        // input validation
        if (!id || !verifyId) return next(createHttpError(400, "Enter model-id in api url correctly."));

        // Create the course in the database
        const module = await prisma.module.update({
            where: {
                id: verifyId,
            },
            data: {
                isPublish: status,
            },
        });

        if (!module) return next(createHttpError(400, "some thing want wrong: try again for publishing module."));

        res.status(200).json({ message: "Module updated successfully.", module });
    } catch (error: any) {
        console.log(error.message);
        return next(createHttpError(400, "some thing wait wrong in publishing module."));
    }
}

export async function deleteModule(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;

        const verifyId = Number(id);
        // input validation
        if (!id || !verifyId) return next(createHttpError(400, "Enter model-id in api url correctly."));

        // Create the course in the database
        const module = await prisma.module.delete({
            where: {
                id: verifyId,
            },
        });

        if (!module) return next(createHttpError(400, "some thing want wrong: try again for deleting module."));

        res.status(200).json({ message: "Module delete successfully.", module });
    } catch (error: any) {
        console.log(error);
        console.log(error.message);
        return next(error);
    }
}
