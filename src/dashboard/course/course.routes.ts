import express from "express";
import { createCourse, getAllOwnCourses } from "./course.controller";
import { authenticationMiddleware } from "../../middlewares/auth.middleware";
import { createVideo, deleteLessonVideo, getLessonVideo } from "./video.controller";
import { getAllCourseModules } from "./module.controller";
import { getAllModuleLessons, getLessonById } from "./lesson.controller";
import { createTasks, deleteLessonTask, getLessonTasks } from "./task.controller";

const courseRouter = express.Router();

// courses
courseRouter.post("/", authenticationMiddleware, createCourse);
courseRouter.get("/own", authenticationMiddleware, getAllOwnCourses);

// module
courseRouter.get("/module/:courseId", authenticationMiddleware, getAllCourseModules);

// lessons
courseRouter.get("/lessons/:moduleId", authenticationMiddleware, getAllModuleLessons);
courseRouter.get("/lesson/:lessonId", authenticationMiddleware, getLessonById);

// videos
courseRouter.post("/video", authenticationMiddleware, createVideo);
courseRouter.get("/video/:lessonId", authenticationMiddleware, getLessonVideo);
courseRouter.delete("/video/:lessonId", authenticationMiddleware, deleteLessonVideo);

// task
courseRouter.post("/tasks", authenticationMiddleware, createTasks);
courseRouter.get("/tasks/:lessonId", authenticationMiddleware, getLessonTasks);
courseRouter.delete("/task/:taskId", authenticationMiddleware, deleteLessonTask);

export default courseRouter;
