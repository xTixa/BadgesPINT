import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getSL,
  getSLEstatisticas,
  getSLKpis,
  getSLConsultores,
  getSLCatalogo,
  getSLHistorico,
  getSLRelatorio,
  getSLGamificacao,
  exportSLReportExcel,
  exportSLReportPDF
} from "../controllers/sLController.js";
import { adminGenerateBadgeCertificate } from "../controllers/adminBadgeController.js";

const router = Router();

router.use(protect(["service_line_leader"]));

router.get("/me", getSL);
router.get("/estatisticas", getSLEstatisticas);
router.get("/kpis", getSLKpis);
router.get("/consultores", getSLConsultores);
router.get("/catalogo", getSLCatalogo);
router.get("/historico", getSLHistorico);
router.get("/relatorios", getSLRelatorio);
router.get("/gamificacao", getSLGamificacao);
router.post("/export/excel", exportSLReportExcel);
router.post("/export/pdf", exportSLReportPDF);
router.post("/badges/:badgeId/certificado", adminGenerateBadgeCertificate);

export default router;
