import { Router } from "express";
import { getConsultantBadges } from "../controllers/consultorController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.get("/consultor/:id/badges", authMiddleware, getConsultantBadges);

export default router;
