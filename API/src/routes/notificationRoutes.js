import express from "express";
import * as notificationController from "../controllers/notificationController.js";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", notificationController.obterNotificacoes);
router.get("/unread/count", notificationController.obterContagemNaoLidas);
router.post("/device-token", notificationController.registarDeviceToken);
router.post("/device-token/remove", notificationController.removerDeviceToken);
router.put("/:id/read", notificationController.marcarComoLida);
router.put("/mark/all-read", notificationController.marcarTodasComoLidas);
router.delete("/:id", notificationController.apagarNotificacao);

router.post("/broadcast", adminMiddleware, notificationController.enviarBroadcast);

export default router;
