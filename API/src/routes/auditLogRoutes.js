import express from "express";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";
import {
  getLogs,
  getUserLogs,
  getAuditStats,
  exportLogs,
} from "../controllers/auditLogController.js";

const router = express.Router();

// Rotas de auditoria (apenas para admins)
router.get("/", authMiddleware, adminMiddleware, getLogs);
router.get("/stats", authMiddleware, adminMiddleware, getAuditStats);
router.get("/user/:userId", authMiddleware, adminMiddleware, getUserLogs);
router.get("/export", authMiddleware, adminMiddleware, exportLogs);

export default router;
