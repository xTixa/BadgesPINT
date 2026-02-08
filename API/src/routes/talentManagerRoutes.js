import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getTM,
  getTMEstatisticas,
  getEquipa,
  getTMKpis
} from "../controllers/talentManagerController.js";

const router = Router();

router.get("/me", authMiddleware, getTM);
router.get("/estatisticas", authMiddleware, getTMEstatisticas);
router.get("/equipa", authMiddleware, getEquipa);
router.get("/kpis", authMiddleware, getTMKpis);

export default router;
