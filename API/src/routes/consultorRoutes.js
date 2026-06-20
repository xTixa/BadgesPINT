import { Router } from "express";
import {
  getConsultantBadges,
  generateConsultorBadgeCertificate,
  getConsultorBadgesProgress,
  getConsultantsRanking,
  getConsultantPublicProfile,
  updateConsultorPreferences,
  getConsultorCertificates,
  verifyPublicCertificate,
  getLearningPathProgress,
  updateLessonProgress,
  upsertBadgeReview
} from "../controllers/consultorController.js";
import { submitEvidence, getConsultorEvidencesByBadge, uploadEvidenceFile } from "../controllers/evidenceController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.get("/consultores/ranking", authMiddleware, getConsultantsRanking);
router.get("/consultor/:id/profile", authMiddleware, getConsultantPublicProfile);
router.get("/consultor/learning-paths/progress", authMiddleware, getLearningPathProgress);
router.get("/consultor/certificates", authMiddleware, getConsultorCertificates);
router.put("/consultor/preferences", authMiddleware, updateConsultorPreferences);
router.put("/consultor/lessons/:lessonId/progress", authMiddleware, updateLessonProgress);
router.put("/consultor/badges/:badgeId/review", authMiddleware, upsertBadgeReview);
router.get("/consultor/:id/badges", authMiddleware, getConsultantBadges);
router.get("/consultor/:id/badges-progress", authMiddleware, getConsultorBadgesProgress);
router.post("/consultor/badges/:badgeId/certificado", authMiddleware, generateConsultorBadgeCertificate);
router.post("/consultor/evidencias/upload", authMiddleware, uploadEvidenceFile);
router.post("/consultor/requirements/:requirementId/evidencias", authMiddleware, submitEvidence);
router.get("/consultor/badges/:badgeId/evidencias", authMiddleware, getConsultorEvidencesByBadge);

router.get("/public/certificates/:code", verifyPublicCertificate);

export default router;
