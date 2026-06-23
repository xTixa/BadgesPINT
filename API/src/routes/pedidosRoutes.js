import { Router } from "express";
import {
  getAllPedidos,
  getPedidoById,
  aprovarPedido,
  rejeitarPedido,
  criarPedido,
  cancelarPedido,
  submeterPedido,
  tmValidarPedido,
  tmDevolverPedido,
  slAprovarPedido,
  slRejeitarPedido,
  slDevolverPedido,
  getPedidosStats
} from "../controllers/pedidosController.js";
import authMiddleware, { rolesMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authMiddleware);

// Listar pedidos (com filtro opcional por status)
router.get("/", getAllPedidos);

// Obter estatísticas
router.get("/stats", rolesMiddleware(["admin", "talent_manager", "service_line_leader"]), getPedidosStats);

// Obter um pedido
router.get("/:id", getPedidoById);

// Criar novo pedido (consultores)
router.post("/", rolesMiddleware(["consultant"]), criarPedido);

// Submeter pedido (Open -> Submitted)
router.post("/:id/submeter", rolesMiddleware(["consultant"]), submeterPedido);

// Aprovar pedido (admin/TM/SL)
router.post("/:id/aprovar", rolesMiddleware(["admin"]), aprovarPedido);

// Rejeitar pedido (admin/TM/SL)
router.post("/:id/rejeitar", rolesMiddleware(["admin"]), rejeitarPedido);

// Workflow Talent Manager
router.post("/:id/tm/validar", rolesMiddleware(["talent_manager"]), tmValidarPedido);
router.post("/:id/tm/devolver", rolesMiddleware(["talent_manager"]), tmDevolverPedido);

// Workflow Service Line
router.post("/:id/sl/aprovar", rolesMiddleware(["service_line_leader"]), slAprovarPedido);
router.post("/:id/sl/rejeitar", rolesMiddleware(["service_line_leader"]), slRejeitarPedido);
router.post("/:id/sl/devolver", rolesMiddleware(["service_line_leader"]), slDevolverPedido);

// Cancelar pedido (consultores)
router.delete("/:id", rolesMiddleware(["consultant"]), cancelarPedido);

export default router;
