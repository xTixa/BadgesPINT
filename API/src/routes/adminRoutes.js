import { Router } from "express";
import {
  getAdminStats,
  getAdminKpis,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  testEmailConfig
} from "../controllers/adminController.js";
import {
  exportToExcel,
  exportToPDF,
  exportPreview
} from "../controllers/exportController.js";
import { runGoalReminderJob } from "../jobs/reminderJob.js";
import { runSLAAlertJob } from "../jobs/slaAlertJob.js";
import { listEmailTemplates, resetEmailTemplate, saveEmailTemplate } from "../controllers/emailTemplateController.js";
import { getPlatformSettings, updatePlatformSettings } from "../controllers/platformSettingsController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// Tudo no Admin requer autenticação
router.use(protect(["admin"]));

// Definições globais da plataforma
router.get("/settings", getPlatformSettings);
router.put("/settings", updatePlatformSettings);

// Dashboard
router.get("/stats", getAdminStats);
router.get("/stats/kpis", getAdminKpis);

// Gestão de utilizadores
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// Exportação
router.post("/export/excel", exportToExcel);
router.post("/export/pdf", exportToPDF);
router.post("/export/preview", exportPreview);

router.post("/email/test", testEmailConfig);
router.get("/email/templates", listEmailTemplates);
router.put("/email/templates/:key", saveEmailTemplate);
router.delete("/email/templates/:key", resetEmailTemplate);
router.post("/jobs/goal-reminders/run", async (req, res) => {
  try {
    res.json(await runGoalReminderJob({ daysAhead: Number(req.body?.daysAhead || 7) }));
  } catch (error) {
    console.error("Erro ao executar job de objetivos:", error);
    res.status(500).json({ message: "Erro ao executar job de objetivos" });
  }
});
router.post("/jobs/sla-alerts/run", async (req, res) => {
  try {
    res.json(await runSLAAlertJob());
  } catch (error) {
    console.error("Erro ao executar job de SLA:", error);
    res.status(500).json({ message: "Erro ao executar job de SLA" });
  }
});

export default router;
