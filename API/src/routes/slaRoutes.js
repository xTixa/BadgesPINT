import { Router } from "express";
import {
  getAllSLAs,
  getSLAById,
  createSLA,
  updateSLA,
  deleteSLA,
  getSLAsByTeamType,
  checkSLAAlerts
} from "../controllers/slaController.js";
import authMiddleware, { rolesMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authMiddleware);

// Listar todos os SLAs
router.get("/", getAllSLAs);

// Obter SLAs por tipo de equipa
router.get("/team-type/:teamType", getSLAsByTeamType);

// Verificar pedidos fora de SLA e notificar responsaveis
router.post("/check-alerts", rolesMiddleware(["admin"]), checkSLAAlerts);

// Obter um SLA
router.get("/:id", getSLAById);

// Criar novo SLA
router.post("/", rolesMiddleware(["admin"]), createSLA);

// Atualizar SLA
router.put("/:id", rolesMiddleware(["admin"]), updateSLA);

// Deletar SLA
router.delete("/:id", rolesMiddleware(["admin"]), deleteSLA);

export default router;
