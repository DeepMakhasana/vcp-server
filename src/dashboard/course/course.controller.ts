import { NextFunction, Request, Response } from "express";
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

function slugify(title: string) {
    return (
        title
            .toLowerCase()
            .trim()
            .replace(/[\s]+/g, "-") // Replace spaces with hyphens
            .replace(/[^a-z0-9-]+/g, "") // Remove special characters
            .replace(/^-+|-+$/g, "") || "untitled"
    ); // Remove leading/trailing hyphens, fallback to 'untitled'
}

export async function createCourse(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        const { title, description, price, image, highlights, outcomes, prerequisites, status } = req.body as Course;

        const slug = slugify(title);

        // Create the course in the database
        const newCourse = await prisma.course.create({
            data: {
                title,
                slug,
                description,
                price: Number(price),
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

export async function updateCourse(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        const { title, description, price, image, highlights, outcomes, prerequisites, status } = req.body as Course;
        const { id } = req.params;

        const courseId = Number(id);

        // Create the course in the database
        const updateCourse = await prisma.course.update({
            where: {
                id: courseId,
            },
            data: {
                title,
                description,
                price,
                image,
                highlights,
                outcomes,
                prerequisites,
                status,
            },
        });

        if (!updateCourse) return next(createHttpError(400, "some thing want wrong: try again for updating course."));

        res.status(200).json({ message: "Course updated successfully.", course: updateCourse });
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
            orderBy: {
                updatedAt: "asc",
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

export async function getCourse(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;
        const courseId = Number(id);

        // Get all the courses of creator in the database
        const course = await prisma.course.findUnique({
            where: {
                id: courseId,
            },
        });

        if (!course) return next(createHttpError(400, "some thing want wrong: try again for getting course."));

        res.status(200).json({ course });
    } catch (error: any) {
        console.log(error.message);
        return next(createHttpError(400, "some thing wait wrong in getting course."));
    }
}

export async function deleteCourse(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;

        const verifyId = Number(id);
        // input validation
        if (!id || !verifyId) return next(createHttpError(400, "Enter course-id in api url correctly."));

        // Create the course in the database
        const course = await prisma.course.delete({
            where: {
                id: verifyId,
            },
        });

        if (!course) return next(createHttpError(400, "some thing want wrong: try again for deleting course."));

        res.status(200).json({ message: "Course delete successfully.", course });
    } catch (error: any) {
        console.log(error);
        console.log(error.message);
        return next(error);
    }
}

export async function getCourseBySlug(req: Request, res: Response, next: NextFunction) {
    try {
        const { slug } = req.params;

        // Get all the courses of creator in the database
        const course = await prisma.course.findFirst({
            where: {
                slug,
            },
            select: {
                id: true,
                title: true,
                price: true,
                image: true,
            },
        });

        if (!course)
            return next(createHttpError(400, "some thing want wrong: try again for getting details of course."));

        res.status(200).json(course);
    } catch (error: any) {
        console.log(error.message);
        return next(createHttpError(400, "some thing wait wrong in getting details of course."));
    }
}
