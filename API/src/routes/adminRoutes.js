import { Router } from "express";
import {
  getAdminStats,
  getAllUsers,
  createUser,
  deleteUser
} from "../controllers/adminController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

// Tudo no Admin requer autenticação
router.use(authMiddleware);

// Dashboard
router.get("/stats", getAdminStats);

// Gestão de utilizadores
router.get("/users", getAllUsers);
router.post("/users", createUser);
router.delete("/users/:id", deleteUser);

export default router;
