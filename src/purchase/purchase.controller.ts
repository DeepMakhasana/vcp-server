import { NextFunction, Response } from "express";
import createHttpError from "http-errors";
import prisma from "../config/prisma";
import { RequestWithUser } from "../middlewares/auth.middleware";

function getCourseEndDateTime(daysToAdd: number, hoursToAdd = 0, minutesToAdd = 0) {
    // Get the current datetime
    const currentDateTime = new Date();

    // Add the specified number of days, hours, and minutes
    currentDateTime.setDate(currentDateTime.getDate() + daysToAdd);
    // currentDateTime.setHours(0);
    // currentDateTime.setMinutes(0);

    // Convert to ISO string (compatible with Prisma's DateTime type)
    return currentDateTime.toISOString();
}

export async function purchaseCourse(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        const { courseId, price, duration } = req.body;
        const userId = req.user?.id;
        const endAt = getCourseEndDateTime(duration);

        // Get all the courses of creator in the database
        const purchase = await prisma.purchase.create({
            data: {
                courseId: Number(courseId),
                price: Number(price),
                userId: Number(userId),
                endAt,
            },
        });

        if (!purchase) return next(createHttpError(400, "some thing want wrong: try again for course purchase."));

        res.status(200).json(purchase);
    } catch (error: any) {
        console.log(error.message);
        return next(createHttpError(400, "some thing wait wrong in getting all creator purchase."));
    }
}

export async function getUserPurchaseCourse(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        const userId = req.user?.id;

        // Get all the courses of creator in the database
        const courses = await prisma.purchase.findMany({
            where: {
                userId: Number(userId),
            },
            include: {
                course: {
                    select: {
                        id: true,
                        slug: true,
                        title: true,
                        image: true,
                        duration: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                },
            },
        });

        if (!courses)
            return next(createHttpError(400, "some thing want wrong: try again for getting purchase courses."));

        console.log(courses);
        res.status(200).json(courses);
    } catch (error: any) {
        console.log(error.message);
        return next(createHttpError(400, "some thing wait wrong in getting purchase courses."));
    }
}
