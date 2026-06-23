import express from "express";
import * as ticketController from "../controllers/ticketController.js";
import { authMiddleware, rolesMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", ticketController.criarTicket);
router.get("/meus", ticketController.obterMeusTickets);

router.get("/stats/estatisticas", rolesMiddleware(["admin"]), ticketController.obterEstatisticas);
router.get("/", rolesMiddleware(["admin"]), ticketController.obterTodosTickets);
router.put("/:id", rolesMiddleware(["admin"]), ticketController.atualizarTicket);

router.get("/:id", ticketController.obterTicket);

export default router;
