import express from "express";
import * as notificationController from "../controllers/notificationController.js";
import { authMiddleware, rolesMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", notificationController.obterNotificacoes);
router.get("/unread/count", notificationController.obterContagemNaoLidas);
router.get(
  "/announcements",
  rolesMiddleware(["admin", "service_line_leader", "talent_manager"]),
  notificationController.listarAvisosBroadcast
);
router.put(
  "/announcements/:id",
  rolesMiddleware(["admin", "service_line_leader", "talent_manager"]),
  notificationController.atualizarAvisoBroadcast
);
router.delete(
  "/announcements/:id",
  rolesMiddleware(["admin", "service_line_leader", "talent_manager"]),
  notificationController.apagarAvisoBroadcast
);
router.post("/device-token", notificationController.registarDeviceToken);
router.post("/device-token/remove", notificationController.removerDeviceToken);
router.put("/:id/read", notificationController.marcarComoLida);
router.put("/mark/all-read", notificationController.marcarTodasComoLidas);
router.delete("/:id", notificationController.apagarNotificacao);

router.post(
  "/broadcast",
  rolesMiddleware(["admin", "service_line_leader", "talent_manager"]),
  notificationController.enviarBroadcast
);

export default router;
