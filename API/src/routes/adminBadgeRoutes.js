import { Router } from "express";
import {
  adminGetAllBadges,
  adminGetBadge,
  adminCreateBadge,
  adminUpdateBadge,
  adminDeleteBadge,
  adminGenerateBadgeImage,
  adminUploadBadgeImage
} from "../controllers/adminBadgeController.js";

const router = Router();

router.get("/", adminGetAllBadges);
router.get("/:id", adminGetBadge);
router.post("/", adminCreateBadge);
router.post("/generate-image", adminGenerateBadgeImage);
router.post("/upload-image", adminUploadBadgeImage);
router.put("/:id", adminUpdateBadge);
router.delete("/:id", adminDeleteBadge);

export default router;
