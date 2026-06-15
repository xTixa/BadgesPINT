import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getTM,
  getTMEstatisticas,
  getEquipa,
  getTMKpis,
  getTMCatalogo,
  getTMHistorico,
  getTMRelatorio,
  exportTMReportExcel,
  exportTMReportPDF
} from "../controllers/talentManagerController.js";
import { listEvidencesForTM, approveEvidence, rejectEvidence } from "../controllers/evidenceController.js";
import { adminGenerateBadgeCertificate } from "../controllers/adminBadgeController.js";

const router = Router();

router.use(protect(["talent_manager"]));

router.get("/me", getTM);
router.get("/estatisticas", getTMEstatisticas);
router.get("/equipa", getEquipa);
router.get("/kpis", getTMKpis);
router.get("/catalogo", getTMCatalogo);
router.get("/historico", getTMHistorico);
router.get("/relatorios", getTMRelatorio);
router.post("/export/excel", exportTMReportExcel);
router.post("/export/pdf", exportTMReportPDF);
router.post("/badges/:badgeId/certificado", adminGenerateBadgeCertificate);
router.get("/evidencias", listEvidencesForTM);
router.put("/evidencias/:id/aprovar", approveEvidence);
router.put("/evidencias/:id/rejeitar", rejectEvidence);

export default router;
