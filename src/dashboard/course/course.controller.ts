import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import prisma from "../../config/prisma";
import { RequestWithUser } from "../../middlewares/auth.middleware";
import { sendCourseCompletionRequest, sendPublishRequest } from "../../services/email";

interface Course {
    title: string;
    description: string;
    price: number;
    image: string;
    highlights: string;
    outcomes: string;
    prerequisites: string;
    status: boolean;
    duration: number;
}

function slugify(title: string) {
    return (
        title
            .toLowerCase()
            .trim()
            .replace(/[\s-]+/g, " ") // Replace spaces or hyphens with a single space
            .replace(/[\s]+/g, "-") // Replace spaces with hyphens
            .replace(/[^a-z0-9-]+/g, "") // Remove special characters
            .replace(/^-+|-+$/g, "") || "untitled"
    ); // Remove leading/trailing hyphens, fallback to 'untitled'
}

export async function createCourse(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        const { title, description, price, image, highlights, outcomes, duration, prerequisites, status } =
            req.body as Course;

        const slug = slugify(title);
        const creatorId = Number(req?.user?.id);
        // input validation
        if (!creatorId) return next(createHttpError(400, "creator-id not able to get."));

        const courseLastOrder = await prisma.course.findFirst({
            where: { creatorId },
            select: { order: true },
            orderBy: {
                order: "desc",
            },
            take: 1,
        });

        const courseLastOrderCount = courseLastOrder?.order || 0;

        // Create the course in the database
        const newCourse = await prisma.course.create({
            data: {
                title,
                slug,
                description,
                price,
                image,
                highlights,
                outcomes,
                prerequisites,
                duration,
                creatorId,
                status,
                order: courseLastOrderCount + 1,
            },
        });

        if (!newCourse) return next(createHttpError(400, "some thing want wrong: try again for creating course."));

        res.status(200).json({ message: "Course created successfully.", course: newCourse });
    } catch (error) {
        return next(error);
    }
}

export async function updateCourse(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        const { title, description, price, image, highlights, outcomes, prerequisites, duration } = req.body;
        const { id } = req.params;

        const courseId = Number(id);
        // input validation
        if (!courseId) return next(createHttpError(400, "please course-id provide in url."));

        // Create the course in the database
        const updateCourse = await prisma.course.update({
            where: {
                id: courseId,
            },
            data: {
                title,
                description,
                price,
                duration,
                image: `${image}?updateAt=${new Date().getTime()}`,
                highlights,
                outcomes,
                prerequisites,
            },
        });

        if (!updateCourse) return next(createHttpError(400, "some thing want wrong: try again for updating course."));

        res.status(200).json({ message: "Course updated successfully.", course: updateCourse });
    } catch (error: any) {
        console.log(error.message);
        return next(error);
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

export const updateCourseOrder = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { orders } = req.body; // moduleOrders = [{ id: 1, order: 1 }, { id: 2, order: 2 }]

    try {
        // Use a transaction to perform all updates in one atomic operation
        await prisma.$transaction(
            orders.map((course: { id: number; order: number }) =>
                prisma.course.update({
                    where: { id: course.id },
                    data: { order: course.order },
                })
            )
        );

        res.status(200).json({ message: "Course order updated successfully." });
    } catch (error) {
        return next(error);
    }
};

export async function getAllOwnCourses(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        const creatorId = Number(req?.user?.id);
        // input validation
        if (!creatorId) return next(createHttpError(400, "creator-id not able to get."));

        // Get all the courses of creator in the database
        const courses = await prisma.course.findMany({
            where: {
                creatorId,
            },
            orderBy: {
                order: "asc",
            },
        });

        if (!courses)
            return next(createHttpError(400, "some thing want wrong: try again for getting all own courses."));

        res.status(200).json({ courses });
    } catch (error: any) {
        console.log(error.message);
        return next(error);
    }
}

export async function getCourse(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;
        const courseId = Number(id);

        // input validation
        if (!courseId) return next(createHttpError(400, "please course-id provide in url."));

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
        return next(error);
    }
}

export async function getCourseBySlug(req: Request, res: Response, next: NextFunction) {
    try {
        const { slug } = req.params;

        console.log(slug);

        // Get all the courses of creator in the database
        const course = await prisma.course.findUnique({
            where: {
                slug,
            },
            select: {
                id: true,
                title: true,
                price: true,
                image: true,
                duration: true,
            },
        });

        res.status(200).json(course);
    } catch (error: any) {
        console.log(error.message);
        return next(error);
    }
}

export async function publishRequest(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        if (req.user?.domain) {
            // send public request
            const email = await sendPublishRequest(req.user?.domain);

            if (email) {
                res.status(200).json({
                    message: `Public request sended successfully, changes update in 5 to 6 hours.`,
                });
            } else {
                return next(createHttpError(400, "some thing wait wrong: try again for public course."));
            }
        } else {
            return next(createHttpError(400, "try again for public course."));
        }
    } catch (error: any) {
        console.log(error.message);
        return next(error);
    }
}

export async function courseCompletionRequest(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        const { purchaseId } = req.body;
        const creatorId = req?.user?.creatorId;

        const verifiedPurchaseId = Number(purchaseId);

        // input validation
        if (!verifiedPurchaseId) return next(createHttpError(400, "please course-id provide in url."));

        const creatorEmail = await prisma.creator.findUnique({
            where: {
                id: creatorId,
            },
            select: {
                email: true,
            },
        });

        console.log("creatorEmail", creatorEmail);

        const courseDetail = await prisma.purchase.findUnique({
            where: {
                id: verifiedPurchaseId,
            },
            include: {
                course: {
                    select: {
                        title: true,
                        duration: true,
                    },
                },
            },
        });

        console.log("courseDetail", courseDetail);
        console.log("userId", courseDetail);

        if (req?.user?.id === courseDetail?.userId && verifiedPurchaseId === courseDetail?.id) {
            // send public request
            const email = await sendCourseCompletionRequest(req?.user, courseDetail, creatorEmail?.email);

            if (email) {
                res.status(200).json({
                    message: `Certificate request sended successfully, certificate sended on your whatsApp and email in 5 to 6 working hours.`,
                });
            } else {
                return next(createHttpError(400, "some thing wait wrong: try again for Certificate request."));
            }
        } else {
            return next(createHttpError(400, "try again for Certificate request."));
        }
    } catch (error: any) {
        console.log(error.message);
        return next(error);
    }
}

export async function coursePublishStatusChange(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        const { status, courseId } = req.body;

        const id = Number(courseId);
        // input validation
        if (!id) return next(createHttpError(400, "please course-id provide in url."));

        const updateStatus = await prisma.course.update({
            where: {
                id,
            },
            data: {
                status,
            },
        });

        res.status(200).json({ message: "Course visibility status updated successfully.", course: updateStatus });
    } catch (error: any) {
        console.log(`Error in course status change: ${error.message}`);
        return next(error);
    }
}
