import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getSL,
  getSLEstatisticas,
  getSLKpis
} from "../controllers/sLController.js";

const router = Router();

router.use(protect(["service_line_leader"]));

router.get("/me", getSL);
router.get("/estatisticas", getSLEstatisticas);
router.get("/kpis", getSLKpis);

export default router;
