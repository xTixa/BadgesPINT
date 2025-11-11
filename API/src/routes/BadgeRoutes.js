import express from "express";
import { getAllBadges, getBadgesByArea } from "../controllers/BadgeController.js";

const router = express.Router();

router.get("/badges", getAllBadges); // GET /badges - retorna todos os badges
router.get("/areas/:id/badges", getBadgesByArea); // id = area id

export default router;
