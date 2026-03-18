import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getTM,
  getTMEstatisticas,
  getEquipa,
  getTMKpis
} from "../controllers/talentManagerController.js";
import { listEvidencesForTM, approveEvidence, rejectEvidence } from "../controllers/evidenceController.js";

const router = Router();

router.use(protect(["talent_manager"]));

router.get("/me", getTM);
router.get("/estatisticas", getTMEstatisticas);
router.get("/equipa", getEquipa);
router.get("/kpis", getTMKpis);
router.get("/evidencias", listEvidencesForTM);
router.put("/evidencias/:id/aprovar", approveEvidence);
router.put("/evidencias/:id/rejeitar", rejectEvidence);

export default router;
