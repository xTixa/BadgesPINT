import { Router } from "express";
import {
  adminGetAllBadges,
  adminGetBadge,
  adminCreateBadge,
  adminUpdateBadge,
  adminDeleteBadge
} from "../controllers/adminBadgeController.js";

const router = Router();

router.get("/", adminGetAllBadges);
router.get("/:id", adminGetBadge);
router.post("/", adminCreateBadge);
router.put("/:id", adminUpdateBadge);
router.delete("/:id", adminDeleteBadge);

export default router;
