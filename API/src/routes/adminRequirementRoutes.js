import { Router } from "express";
import {
  adminGetRequirements,
  adminCreateRequirement,
  adminUpdateRequirement,
  adminDeleteRequirement
} from "../controllers/adminRequirementController.js";

const router = Router();

// GET requisitos por badge
router.get("/:badge_id", adminGetRequirements);

// criar
router.post("/", adminCreateRequirement);

// editar
router.put("/:id", adminUpdateRequirement);

// apagar
router.delete("/:id", adminDeleteRequirement);

export default router;
