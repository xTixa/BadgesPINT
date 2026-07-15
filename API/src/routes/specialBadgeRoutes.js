import { Router } from "express";
import { createSpecialBadge } from "../controllers/adminBadgeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/", protect(["admin", "talent_manager", "service_line_leader"]), createSpecialBadge);

export default router;
