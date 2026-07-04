import express from "express";
import {
  getLearningPaths,
  getLearningPathById,
  createLearningPath,
  updateLearningPath,
  deleteLearningPath,
  getServiceLinesByLearningPath,
  getLearningPathTree
} from "../controllers/LearningPathController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getLearningPaths);
router.get("/:id/service-lines", getServiceLinesByLearningPath);
router.get("/:id/tree", getLearningPathTree);  // novo endpoint tree
router.get("/:id", getLearningPathById);
router.post("/", protect(["admin"]), createLearningPath);
router.put("/:id", protect(["admin"]), updateLearningPath);
router.delete("/:id", protect(["admin"]), deleteLearningPath);

export default router;
