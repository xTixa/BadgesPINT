import { Router } from "express";
import { login, firstLogin, getUserProfile } from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.post("/login", login);
router.post("/first-login", authMiddleware, firstLogin);
router.get("/me", authMiddleware, getUserProfile);

export default router;
