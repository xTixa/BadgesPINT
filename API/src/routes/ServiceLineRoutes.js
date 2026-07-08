import express from "express";
import {
  getServiceLinesByLP,
  getServiceLineById,
  createServiceLine,
  updateServiceLine,
  deleteServiceLine,
} from "../controllers/ServiceLineController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:id/service-lines", getServiceLinesByLP); // id = learning_path id (mounted under /learning-paths)

export default router;

export const serviceLineAdminRouter = express.Router();
serviceLineAdminRouter.get("/api/service-lines/:id", getServiceLineById);
serviceLineAdminRouter.post("/api/service-lines", protect(["admin"]), createServiceLine);
serviceLineAdminRouter.put("/api/service-lines/:id", protect(["admin"]), updateServiceLine);
serviceLineAdminRouter.delete("/api/service-lines/:id", protect(["admin"]), deleteServiceLine);
