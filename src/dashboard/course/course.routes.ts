import express from "express";
import { createCourse, deleteCourse, getAllOwnCourses, getCourse, updateCourse } from "./course.controller";
import { authenticationMiddleware } from "../../middlewares/auth.middleware";
import { createVideo, deleteLessonVideo, getLessonVideo } from "./video.controller";
import { createModule, deleteModule, getAllCourseModules, updateModule } from "./module.controller";
import { createLesson, deleteLesson, getAllModuleLessons, getLessonById, updateLesson } from "./lesson.controller";
import { createTasks, deleteLessonTask, getLessonTasks } from "./task.controller";
import { validate } from "../../middlewares/validator.middleware";
import { courseValidationSchema, lessonSchema, moduleSchema } from "./course.schema";

const courseRouter = express.Router();

// module
courseRouter.post("/module", authenticationMiddleware, validate(moduleSchema), createModule);
courseRouter.put("/module/:id", authenticationMiddleware, validate(moduleSchema), updateModule);
courseRouter.delete("/module/:id", authenticationMiddleware, deleteModule);
courseRouter.get("/module/:courseId", authenticationMiddleware, getAllCourseModules);

// lessons
courseRouter.get("/lessons/:moduleId", authenticationMiddleware, getAllModuleLessons);
courseRouter.get("/lesson/:lessonId", authenticationMiddleware, getLessonById);
courseRouter.post("/lesson", authenticationMiddleware, validate(lessonSchema), createLesson);
courseRouter.put("/lesson/:id", authenticationMiddleware, validate(lessonSchema), updateLesson);
courseRouter.delete("/lesson/:id", authenticationMiddleware, deleteLesson);

// videos
courseRouter.post("/video", authenticationMiddleware, createVideo);
courseRouter.get("/video/:lessonId", authenticationMiddleware, getLessonVideo);
courseRouter.delete("/video/:lessonId", authenticationMiddleware, deleteLessonVideo);

// task
courseRouter.post("/tasks", authenticationMiddleware, createTasks);
courseRouter.get("/tasks/:lessonId", authenticationMiddleware, getLessonTasks);
courseRouter.delete("/task/:taskId", authenticationMiddleware, deleteLessonTask);

// courses
courseRouter.post("/", authenticationMiddleware, validate(courseValidationSchema), createCourse);
courseRouter.put("/:id", authenticationMiddleware, validate(courseValidationSchema), updateCourse);
courseRouter.delete("/:id", authenticationMiddleware, deleteCourse);
courseRouter.get("/own", authenticationMiddleware, getAllOwnCourses);
courseRouter.get("/:id", authenticationMiddleware, getCourse);

export default courseRouter;
