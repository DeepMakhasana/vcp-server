import { NextFunction, Response } from "express";
import createHttpError from "http-errors";
import prisma from "../../config/prisma";
import { RequestWithUser } from "../../middlewares/auth.middleware";

interface Course {
    title: string;
    description: string;
    price: number;
    image: string;
    highlights: string;
    outcomes: string;
    prerequisites: string;
    status: boolean;
}

export async function createCourse(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        const { title, description, price, image, highlights, outcomes, prerequisites, status } = req.body as Course;
        // input validation
        if (
            !title ||
            !description ||
            !price ||
            !image ||
            !highlights ||
            !outcomes ||
            !prerequisites ||
            typeof status === null ||
            typeof status === undefined
        )
            return next(createHttpError(400, "Enter all inputs correctly."));

        // Create the course in the database
        const newCourse = await prisma.course.create({
            data: {
                title,
                description,
                price,
                image,
                highlights,
                outcomes,
                prerequisites,
                creatorId: req?.user?.id as number,
                status,
            },
        });

        if (!newCourse) return next(createHttpError(400, "some thing want wrong: try again for creating course."));

        res.status(200).json({ message: "Course created successfully.", course: newCourse });
    } catch (error: any) {
        console.log(error.message);
        return next(createHttpError(400, "some thing wait wrong in create course."));
    }
}

export async function getAllOwnCourses(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        console.log("run..");
        let creatorId = req?.user?.id as number;

        // Get all the courses of creator in the database
        const courses = await prisma.course.findMany({
            where: {
                creatorId,
            },
        });

        if (!courses)
            return next(createHttpError(400, "some thing want wrong: try again for getting all own courses."));

        res.status(200).json({ courses });
    } catch (error: any) {
        console.log(error.message);
        return next(createHttpError(400, "some thing wait wrong in getting all own courses."));
    }
}
