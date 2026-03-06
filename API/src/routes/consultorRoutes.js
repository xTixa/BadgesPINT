import { Router } from "express";
import { getConsultantBadges, generateConsultorBadgeCertificate, getConsultorBadgesProgress } from "../controllers/consultorController.js";
import { submitEvidence, getConsultorEvidencesByBadge } from "../controllers/evidenceController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.get("/consultor/:id/badges", authMiddleware, getConsultantBadges);
router.get("/consultor/:id/badges-progress", authMiddleware, getConsultorBadgesProgress);
router.post("/consultor/badges/:badgeId/certificado", authMiddleware, generateConsultorBadgeCertificate);
router.post("/consultor/requirements/:requirementId/evidencias", authMiddleware, submitEvidence);
router.get("/consultor/badges/:badgeId/evidencias", authMiddleware, getConsultorEvidencesByBadge);

export default router;
