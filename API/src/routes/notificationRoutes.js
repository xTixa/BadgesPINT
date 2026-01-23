import express from "express";
import * as notificationController from "../controllers/notificationController.js";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Rotas de notificações
router.get("/", notificationController.obterNotificacoes); // Obter notificações
router.get("/unread/count", notificationController.obterContagemNaoLidas); // Contagem não lidas
router.put("/:id/read", notificationController.marcarComoLida); // Marcar uma como lida
router.put("/mark/all-read", notificationController.marcarTodasComoLidas); // Marcar todas como lidas
router.delete("/:id", notificationController.apagarNotificacao); // Apagar notificação

// Rota de broadcast (apenas admin)
router.post("/broadcast", adminMiddleware, notificationController.enviarBroadcast);

export default router;
