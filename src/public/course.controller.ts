import { NextFunction, Response, Request } from "express";
import createHttpError from "http-errors";
import prisma from "../config/prisma";

export async function getAllCreatorCourses(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;

        const creatorId = Number(id);
        // input validation
        if (!id || !creatorId) return next(createHttpError(400, "Enter creator-id in api body correctly."));

        // Get all the courses of creator in the database
        const courses = await prisma.course.findMany({
            where: {
                creatorId,
            },
            select: {
                id: true,
                slug: true,
                title: true,
                description: true,
                duration: true,
                image: true,
                creator: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        if (!courses)
            return next(createHttpError(400, "some thing want wrong: try again for getting all creator courses."));

        res.status(200).json(courses);
    } catch (error: any) {
        console.log(error.message);
        return next(createHttpError(400, "some thing wait wrong in getting all creator courses."));
    }
}

export async function getCourseFullDetail(req: Request, res: Response, next: NextFunction) {
    try {
        const { slug } = req.params;

        // Get all the courses of creator in the database
        const course = await prisma.course.findFirst({
            where: {
                slug,
            },
            include: {
                creator: {
                    select: {
                        name: true,
                        bio: true,
                        role: true,
                        email: true,
                        image: true,
                    },
                },
                modules: {
                    include: {
                        lessons: true,
                    },
                },
            },
        });

        if (!course)
            return next(createHttpError(400, "some thing want wrong: try again for getting full details of course."));

        res.status(200).json(course);
    } catch (error: any) {
        console.log(error.message);
        return next(createHttpError(400, "some thing wait wrong in getting full details of course."));
    }
}
