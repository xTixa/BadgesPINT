import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getSL,
  getSLEstatisticas
} from "../controllers/sLController.js";

const router = Router();

router.get("/me", authMiddleware, getSL);
router.get("/estatisticas", authMiddleware, getSLEstatisticas);

export default router;
