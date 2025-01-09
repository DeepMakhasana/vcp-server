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
            include: {
                public: true,
            },
            orderBy: {
                order: "asc",
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
            include: {
                public: true,
                video: true,
                tasks: true,
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
        const { title, moduleId, isVideo, url } = req.body;

        const lessonLastOrder = await prisma.lesson.findFirst({
            where: { moduleId },
            select: { order: true },
            orderBy: {
                order: "desc",
            },
            take: 1,
        });

        const lessonCount = lessonLastOrder?.order || 0;

        // Create the course in the database
        const lesson = await prisma.lesson.create({
            data: {
                title,
                moduleId,
                isVideo,
                order: lessonCount + 1,
            },
        });

        let createPublicVideo;

        if (lesson.id && url) {
            createPublicVideo = await prisma.publicVideo.create({
                data: {
                    lessonId: lesson.id,
                    url,
                },
            });
            res.status(200).json({
                message: "Lesson created successfully.",
                lesson: {
                    ...lesson,
                    public: createPublicVideo,
                },
            });
            return;
        }

        if (!lesson) return next(createHttpError(400, "some thing want wrong: try again for creating lesson."));

        res.status(200).json({ message: "Lesson created successfully.", lesson: { ...lesson, public: null } });
    } catch (error: any) {
        console.log(error.message);
        return next(createHttpError(400, "some thing wait wrong in create lesson."));
    }
}

export async function updateLesson(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        const { title, isVideo, url } = req.body;
        const { id } = req.params;

        // Validate lesson ID
        const verifyId = Number(id);
        if (!id || isNaN(verifyId)) {
            return next(createHttpError(400, "Enter a valid lesson ID in the API URL."));
        }

        // Update the lesson in the database
        const lesson = await prisma.lesson.update({
            where: { id: verifyId },
            data: { title, isVideo },
            include: { public: true },
        });

        if (!lesson) {
            return next(createHttpError(400, "Something went wrong. Please try updating the lesson again."));
        }

        let updatedPublicVideo = null;

        // Handle public video creation or updates
        if (url) {
            if (!lesson.public) {
                updatedPublicVideo = await prisma.publicVideo.create({
                    data: { lessonId: lesson.id, url },
                });
            } else if (lesson.public.url !== url) {
                updatedPublicVideo = await prisma.publicVideo.update({
                    where: { lessonId: lesson.id },
                    data: { url },
                });
            }
        } else if (lesson.public?.url) {
            // Delete public video if URL is removed
            await prisma.publicVideo.delete({
                where: { lessonId: lesson.id },
            });
        }

        res.status(200).json({
            message: "Lesson updated successfully.",
            lesson: {
                ...lesson,
                public: updatedPublicVideo || (url ? lesson.public : null),
            },
        });
    } catch (error: any) {
        console.error(error.message);
        next(createHttpError(400, "Something went wrong while updating the lesson."));
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

export const updateLessonOrder = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { orders } = req.body; // lessonOrders = [{ id: 1, order: 1 }, { id: 2, order: 2 }]

    try {
        // Use a transaction to perform all updates in one atomic operation
        await prisma.$transaction(
            orders.map((lesson: { id: number; order: number }) =>
                prisma.lesson.update({
                    where: { id: lesson.id },
                    data: { order: lesson.order },
                })
            )
        );

        res.status(200).json({ message: "Lesson order updated successfully" });
    } catch (error) {
        console.error("Error updating lesson order:", error);

        // Handle specific Prisma errors if needed
        res.status(500).json({ message: "Internal Server Error" });
    }
};
