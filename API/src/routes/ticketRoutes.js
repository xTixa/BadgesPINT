import express from "express";
import * as ticketController from "../controllers/ticketController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Rotas para utilizadores
router.post("/", ticketController.criarTicket); // Criar novo ticket
router.get("/meus", ticketController.obterMeusTickets); // Obter meus tickets
router.get("/:id", ticketController.obterTicket); // Obter detalhes de um ticket

// Rotas para admin
router.get("/", ticketController.obterTodosTickets); // Obter todos os tickets (admin)
router.put("/:id", ticketController.atualizarTicket); // Atualizar ticket (admin)
router.get("/stats/estatisticas", ticketController.obterEstatisticas); // Estatísticas

export default router;
