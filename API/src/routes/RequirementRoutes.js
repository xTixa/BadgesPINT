import express from "express";
import { getRequirementsByBadge } from "../controllers/RequirementController.js";

const router = express.Router();

router.get("/badges/:id/requirements", getRequirementsByBadge); // id = badge id

export default router;
