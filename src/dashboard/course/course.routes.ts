import express from "express";
import {
    courseCompletionRequest,
    coursePublishStatusChange,
    createCourse,
    deleteCourse,
    getAllOwnCourses,
    getCourse,
    getCourseBySlug,
    publishRequest,
    updateCourse,
    updateCourseOrder,
} from "./course.controller";
import { authenticationMiddleware } from "../../middlewares/auth.middleware";
import { createVideo, deleteLessonVideo, getLessonVideo } from "./video.controller";
import { createModule, deleteModule, getAllCourseModules, updateModule, updateModuleOrder } from "./module.controller";
import {
    createLesson,
    deleteLesson,
    getAllModuleLessons,
    getLessonById,
    updateLesson,
    updateLessonOrder,
} from "./lesson.controller";
import { createTasks, deleteLessonTask, getLessonTasks } from "./task.controller";
import { validate } from "../../middlewares/validator.middleware";
import {
    courseValidationSchema,
    lessonSchema,
    moduleSchema,
    orderSchema,
    coursePublishStatusChangeSchema,
    slugSchema,
} from "./course.schema";

const courseRouter = express.Router();

// module
courseRouter.post("/module", authenticationMiddleware(["creator"]), validate(moduleSchema), createModule);
courseRouter.put("/module/order", authenticationMiddleware(["creator"]), validate(orderSchema), updateModuleOrder);
courseRouter.put("/module/:id", authenticationMiddleware(["creator"]), validate(moduleSchema), updateModule);
courseRouter.delete("/module/:id", authenticationMiddleware(["creator"]), deleteModule);
courseRouter.get("/module/:courseId", authenticationMiddleware(["creator"]), getAllCourseModules);

// lessons
courseRouter.get("/lessons/:moduleId", authenticationMiddleware(["creator"]), getAllModuleLessons);
courseRouter.get("/lesson/:lessonId", authenticationMiddleware(["creator"]), getLessonById);
courseRouter.post("/lesson", authenticationMiddleware(["creator"]), validate(lessonSchema), createLesson);
courseRouter.put("/lesson/order", authenticationMiddleware(["creator"]), validate(orderSchema), updateLessonOrder);
courseRouter.put("/lesson/:id", authenticationMiddleware(["creator"]), validate(lessonSchema), updateLesson);
courseRouter.delete("/lesson/:id", authenticationMiddleware(["creator"]), deleteLesson);

// videos
courseRouter.post("/video", authenticationMiddleware(["creator"]), createVideo);
courseRouter.get("/video/:lessonId", authenticationMiddleware(["creator"]), getLessonVideo);
courseRouter.delete("/video/:lessonId", authenticationMiddleware(["creator"]), deleteLessonVideo);

// task
courseRouter.post("/tasks", authenticationMiddleware(["creator"]), createTasks);
courseRouter.get("/tasks/:lessonId", authenticationMiddleware(["creator"]), getLessonTasks);
courseRouter.delete("/task/:taskId", authenticationMiddleware(["creator"]), deleteLessonTask);

// change publish status
courseRouter.put(
    "/status",
    authenticationMiddleware(["creator"]),
    validate(coursePublishStatusChangeSchema),
    coursePublishStatusChange
);
// publish request
courseRouter.post("/publish", authenticationMiddleware(["creator"]), publishRequest);
// certificate request
courseRouter.post("/certificate", authenticationMiddleware(["student"]), courseCompletionRequest);

// courses
courseRouter.get("/slug/:slug", validate(slugSchema, "params"), getCourseBySlug);
courseRouter.get("/own", authenticationMiddleware(["creator"]), getAllOwnCourses);

courseRouter.get("/:id", authenticationMiddleware(["creator"]), getCourse);
courseRouter.post("/", authenticationMiddleware(["creator"]), validate(courseValidationSchema), createCourse);
courseRouter.put("/order", authenticationMiddleware(["creator"]), validate(orderSchema), updateCourseOrder);
courseRouter.put("/:id", authenticationMiddleware(["creator"]), validate(courseValidationSchema), updateCourse);
courseRouter.delete("/:id", authenticationMiddleware(["creator"]), deleteCourse);

export default courseRouter;
