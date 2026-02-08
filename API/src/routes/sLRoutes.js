import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getSL,
  getSLEstatisticas,
  getSLKpis
} from "../controllers/sLController.js";

const router = Router();

router.get("/me", authMiddleware, getSL);
router.get("/estatisticas", authMiddleware, getSLEstatisticas);
router.get("/kpis", authMiddleware, getSLKpis);

export default router;
