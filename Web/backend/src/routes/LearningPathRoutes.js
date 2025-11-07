import { Router } from "express";
import { getLearningPaths } from "../controllers/LearningPathController.js";

const router = Router();

router.get("/", getLearningPaths);

export default router;
