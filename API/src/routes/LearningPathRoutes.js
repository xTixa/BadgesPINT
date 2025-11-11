import express from "express";
import { 
  getLearningPaths, 
  getServiceLinesByLearningPath, 
  getLearningPathTree 
} from "../controllers/LearningPathController.js";

const router = express.Router();

router.get("/", getLearningPaths);
router.get("/:id/service-lines", getServiceLinesByLearningPath);
router.get("/:id/tree", getLearningPathTree);  // novo endpoint tree

export default router;
