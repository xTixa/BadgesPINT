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
  getConsultorGamification,
  updateLessonProgress,
  upsertBadgeReview,
  getRecomendados,
  getBadgesExpirar,
  getPublicGallery,
  getPreferredAreaBadges,
} from "../controllers/consultorController.js";
import { submitEvidence, getConsultorEvidencesByBadge, uploadEvidenceFile } from "../controllers/evidenceController.js";
import authMiddleware, { optionalAuthMiddleware } from "../middleware/authMiddleware.js";
import { getMyEmailSignature, previewMyEmailSignature, updateMyEmailSignature } from "../controllers/emailSignatureController.js";
import { getPublicRgpdText } from "../controllers/platformSettingsController.js";

const router = Router();

router.get("/consultores/ranking", authMiddleware, getConsultantsRanking);
router.get("/consultor/:id/profile", optionalAuthMiddleware, getConsultantPublicProfile);
router.get("/consultor/learning-paths/progress", authMiddleware, getLearningPathProgress);
router.get("/consultor/certificates", authMiddleware, getConsultorCertificates);
router.get("/consultor/gamification", authMiddleware, getConsultorGamification);
router.get("/consultor/badges-preferenciais", authMiddleware, getPreferredAreaBadges);
router.get("/consultor/email-signature", authMiddleware, getMyEmailSignature);
router.post("/consultor/email-signature/preview", authMiddleware, previewMyEmailSignature);
router.put("/consultor/email-signature", authMiddleware, updateMyEmailSignature);
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
router.get("/public/galeria", getPublicGallery);
router.get("/public/rgpd-text", getPublicRgpdText);
router.get("/consultor/recomendados", authMiddleware, getRecomendados);
router.get("/consultor/badges-expirar", authMiddleware, getBadgesExpirar);

export default router;
