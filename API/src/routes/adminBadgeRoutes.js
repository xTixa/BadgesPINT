import { Router } from "express";
import {
  adminGetAllBadges,
  adminGetBadge,
  adminCreateBadge,
  adminUpdateBadge,
  adminDeleteBadge,
  adminGenerateBadgeImage,
  adminUploadBadgeImage,
  adminGenerateBadgeCertificate,
  adminGetBadgeConsultores
} from "../controllers/adminBadgeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect(["admin"]));

router.get("/", adminGetAllBadges);
router.get("/:badgeId/consultores", adminGetBadgeConsultores);
router.get("/:id", adminGetBadge);
router.post("/", adminCreateBadge);
router.post("/generate-image", adminGenerateBadgeImage);
router.post("/upload-image", adminUploadBadgeImage);
router.post("/:badgeId/certificado", adminGenerateBadgeCertificate);
router.put("/:id", adminUpdateBadge);
router.delete("/:id", adminDeleteBadge);

export default router;
