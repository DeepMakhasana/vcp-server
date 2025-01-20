import { NextFunction, Response } from "express";
import crypto from "crypto";
import createHttpError from "http-errors";
import prisma from "../config/prisma";
import { RequestWithUser } from "../middlewares/auth.middleware";
import Razorpay from "razorpay";
import config from "../config";

const razorpayInstance = new Razorpay({
    key_id: config.razorpayKeyId,
    key_secret: config.razorpayKeySecret,
});

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

export async function getUserPurchaseCourse(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        const userId = req.user?.id;

        // Get all the courses of creator in the database
        const courses = await prisma.purchase.findMany({
            where: {
                userId: Number(userId),
                status: "SUCCESS",
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

export async function purchaseOrder(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        const { courseId, price, duration } = req.body;
        const userId = req.user?.id;
        const endAt = getCourseEndDateTime(duration);

        const options = {
            amount: Number(price * 100),
            currency: "INR",
            receipt: crypto.randomBytes(10).toString("hex"),
            notes: {
                courseId: `${courseId}`,
                duration: `${duration}`,
                userId: `${userId}`,
                endAt,
            },
        };

        razorpayInstance.orders.create(options, async (error, order) => {
            if (error) {
                console.log(error);
                return res.status(500).json({ message: "Something Went Wrong!" });
            }
            // Get all the courses of creator in the database
            const purchase = await prisma.purchase.create({
                data: {
                    order_id: order.id,
                    courseId: Number(courseId),
                    price: Number(price),
                    userId: Number(userId),
                    endAt,
                },
            });
            if (!purchase) return next(createHttpError(400, "some thing want wrong: try again for course purchase."));

            console.log(order);
            res.status(200).json(order);
        });
    } catch (error: any) {
        console.log(error.message);
        return next(createHttpError(400, "some thing wait wrong in getting all creator purchase."));
    }
}

export async function purchaseOrderVerify(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId, userId } = req.body;
        const authUserId = req.user?.id;
        console.log("courseId", courseId);

        // Create Sign
        const sign = razorpay_order_id + "|" + razorpay_payment_id;

        // Create ExpectedSign
        const expectedSign = crypto
            .createHmac("sha256", config.razorpayKeySecret)
            .update(sign.toString())
            .digest("hex");

        // Create isAuthentic
        const isAuthentic = expectedSign === razorpay_signature;

        if (isAuthentic && authUserId == userId) {
            // update purchase order
            const updatePurchase = await prisma.purchase.update({
                where: {
                    order_id: String(razorpay_order_id),
                },
                data: {
                    payment_id: String(razorpay_payment_id),
                    signature: String(razorpay_signature),
                    status: "SUCCESS",
                },
            });
            console.log(updatePurchase);
            if (!updatePurchase)
                return next(createHttpError(400, "some thing want wrong: try again for course purchase."));
            res.status(200).json(updatePurchase);
        } else {
            // update purchase order with fail
            const updatePurchase = await prisma.purchase.update({
                where: {
                    order_id: String(razorpay_order_id),
                },
                data: {
                    payment_id: String(razorpay_payment_id),
                    status: "FAILED",
                },
            });
            console.log(updatePurchase);
            res.status(400).json(updatePurchase);
        }
    } catch (error: any) {
        console.log(error.message);
        return next(createHttpError(400, "some thing wait wrong: try again for course purchase."));
    }
}

// --------------------------------
function getCurrentWeekStartEnd() {
    const today = new Date();

    // Get the current day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const dayOfWeek = today.getDay();

    const mondayDiff = today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1); // Calculate Monday
    const sundayDiff = mondayDiff + 6;

    const startOfWeek = new Date(today.setDate(mondayDiff));
    const endOfWeek = new Date(today.setDate(sundayDiff));

    return {
        start: startOfWeek,
        end: endOfWeek,
    };
}

function getCurrentMonthStartEnd() {
    const today = new Date();

    // Start of the month: Set date to the 1st
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 2);

    // End of the month: Set date to the last day of the month
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    return {
        start: startOfMonth,
        end: endOfMonth,
    };
}

function getCurrentYearStartEnd() {
    const today = new Date();

    // Start of the year: January 1st
    const startOfYear = new Date(today.getFullYear(), 0, 2);

    // End of the year: December 31st
    const endOfYear = new Date(today.getFullYear(), 11, 32);

    return {
        start: startOfYear,
        end: endOfYear,
    };
}

export async function purchaseOrdersDetails(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        const { range } = req.params;
        const creatorId = req.user?.id;

        let startDate;
        let endDate;
        switch (range) {
            case "week":
                const weekDate = getCurrentWeekStartEnd();
                startDate = weekDate.start;
                endDate = weekDate.end;
                break;
            case "month":
                const monthDate = getCurrentMonthStartEnd();
                startDate = monthDate.start;
                endDate = monthDate.end;
                break;
            case "year":
                const yearDate = getCurrentYearStartEnd();
                startDate = yearDate.start;
                endDate = yearDate.end;
                break;
            default:
                return next(createHttpError(400, "please provide range like, week, month or year in query params."));
        }

        const getOwnCoursesId = await prisma.course.findMany({
            where: {
                creatorId,
            },
            select: {
                id: true,
            },
        });

        // Extract course IDs
        const courseIds = getOwnCoursesId.map((course) => course.id);

        const purchaseOrders = await prisma.purchase.findMany({
            where: {
                courseId: {
                    in: courseIds,
                },
                createdAt: { gte: startDate, lte: endDate },
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        mobile: true,
                    },
                },
                course: {
                    select: {
                        title: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        res.status(200).json(purchaseOrders);
    } catch (error: any) {
        console.log(error.message);
        return next(createHttpError(400, "some thing wait wrong: try again for purchased course detail."));
    }
}

export async function totalAmountPurchaseOrders(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        const { range } = req.params;
        const creatorId = req.user?.id;

        let startDate;
        let endDate;
        switch (range) {
            case "week":
                const weekDate = getCurrentWeekStartEnd();
                startDate = weekDate.start;
                endDate = weekDate.end;
                break;
            case "month":
                const monthDate = getCurrentMonthStartEnd();
                startDate = monthDate.start;
                endDate = monthDate.end;
                break;
            case "year":
                const yearDate = getCurrentYearStartEnd();
                startDate = yearDate.start;
                endDate = yearDate.end;
                break;
            default:
                return next(createHttpError(400, "please provide range like, week, month or year in query params."));
        }

        const getOwnCoursesId = await prisma.course.findMany({
            where: {
                creatorId,
            },
            select: {
                id: true,
            },
        });

        // Extract course IDs
        const courseIds = getOwnCoursesId.map((course) => course.id);

        const totalAmountOrders = await prisma.purchase.aggregate({
            _sum: {
                price: true,
            },
            where: {
                courseId: {
                    in: courseIds,
                },
                createdAt: { gte: startDate, lte: endDate },
            },
        });

        res.status(200).json(totalAmountOrders);
    } catch (error: any) {
        console.log(error.message);
        return next(createHttpError(400, "some thing wait wrong: try again for purchased course detail."));
    }
}
