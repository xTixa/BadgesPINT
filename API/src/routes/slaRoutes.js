import { Router } from "express";
import {
  getAllSLAs,
  getSLAById,
  createSLA,
  updateSLA,
  deleteSLA,
  getSLAsByTeamType
} from "../controllers/slaController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.use(authMiddleware);

// Listar todos os SLAs
router.get("/", getAllSLAs);

// Obter SLAs por tipo de equipa
router.get("/team-type/:teamType", getSLAsByTeamType);

// Obter um SLA
router.get("/:id", getSLAById);

// Criar novo SLA
router.post("/", createSLA);

// Atualizar SLA
router.put("/:id", updateSLA);

// Deletar SLA
router.delete("/:id", deleteSLA);

export default router;
