import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getTM,
  getTMEstatisticas,
  getEquipa,
  getTMKpis
} from "../controllers/talentManagerController.js";
import { listEvidencesForTM, approveEvidence, rejectEvidence } from "../controllers/evidenceController.js";

const router = Router();

router.get("/me", authMiddleware, getTM);
router.get("/estatisticas", authMiddleware, getTMEstatisticas);
router.get("/equipa", authMiddleware, getEquipa);
router.get("/kpis", authMiddleware, getTMKpis);
router.get("/evidencias", authMiddleware, listEvidencesForTM);
router.put("/evidencias/:id/aprovar", authMiddleware, approveEvidence);
router.put("/evidencias/:id/rejeitar", authMiddleware, rejectEvidence);

export default router;
