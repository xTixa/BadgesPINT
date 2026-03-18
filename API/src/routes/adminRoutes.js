import { Router } from "express";
import {
  getAdminStats,
  getAdminKpis,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser
} from "../controllers/adminController.js";
import {
  exportToExcel,
  exportToPDF,
  exportPreview
} from "../controllers/exportController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// Tudo no Admin requer autenticação
router.use(protect(["admin"]));

// Dashboard
router.get("/stats", getAdminStats);
router.get("/stats/kpis", getAdminKpis);

// Gestão de utilizadores
router.get("/users", getAllUsers);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// Exportação
router.post("/export/excel", exportToExcel);
router.post("/export/pdf", exportToPDF);
router.post("/export/preview", exportPreview);

export default router;
