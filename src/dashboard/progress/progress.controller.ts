import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import prisma from "../../config/prisma";
import { RequestWithUser } from "../../middlewares/auth.middleware";

export async function createProgress(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        const { purchaseId, lessonId } = req.body;

        const verifyLessonId = Number(lessonId);
        // input validation
        if (!purchaseId || !verifyLessonId) return next(createHttpError(400, "enter valid id."));

        // Create the course in the database
        const progress = await prisma.progress.create({
            data: {
                purchaseId: purchaseId,
                lessonId: verifyLessonId,
            },
        });

        res.status(200).json(progress);
    } catch (error) {
        return next(error);
    }
}
