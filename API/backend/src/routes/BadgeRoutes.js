import express from "express";
import { getBadgesByArea } from "../controllers/BadgeController.js";

const router = express.Router();

router.get("/areas/:id/badges", getBadgesByArea); // id = area id

export default router;
