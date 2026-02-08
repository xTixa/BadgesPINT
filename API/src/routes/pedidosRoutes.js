import { Router } from "express";
import {
  getAllPedidos,
  getPedidoById,
  aprovarPedido,
  rejeitarPedido,
  criarPedido,
  cancelarPedido,
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

// Aprovar pedido (admin/TM/SL)
router.post("/:id/aprovar", aprovarPedido);

// Rejeitar pedido (admin/TM/SL)
router.post("/:id/rejeitar", rejeitarPedido);

// Cancelar pedido (consultores)
router.delete("/:id", cancelarPedido);

export default router;
