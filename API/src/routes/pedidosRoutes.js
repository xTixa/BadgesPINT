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
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.use(authMiddleware);

// Listar pedidos (com filtro opcional por status)
router.get("/", getAllPedidos);

// Obter estatísticas
router.get("/stats", getPedidosStats);

// Obter um pedido
router.get("/:id", getPedidoById);

// Criar novo pedido (consultores)
router.post("/", criarPedido);

// Submeter pedido (Open -> Submitted)
router.post("/:id/submeter", submeterPedido);

// Aprovar pedido (admin/TM/SL)
router.post("/:id/aprovar", aprovarPedido);

// Rejeitar pedido (admin/TM/SL)
router.post("/:id/rejeitar", rejeitarPedido);

// Workflow Talent Manager
router.post("/:id/tm/validar", tmValidarPedido);
router.post("/:id/tm/devolver", tmDevolverPedido);

// Workflow Service Line
router.post("/:id/sl/aprovar", slAprovarPedido);
router.post("/:id/sl/rejeitar", slRejeitarPedido);
router.post("/:id/sl/devolver", slDevolverPedido);

// Cancelar pedido (consultores)
router.delete("/:id", cancelarPedido);

export default router;
