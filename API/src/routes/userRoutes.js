import { Router } from "express";
import { getAllUsers, registerConsultant, updateProfile, changePassword } from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", getAllUsers);
router.post("/register", registerConsultant);

// Rotas protegidas
router.put("/:id", authMiddleware, updateProfile);
router.put("/:id/password", authMiddleware, changePassword);

export default router;
