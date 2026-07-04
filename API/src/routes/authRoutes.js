import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
	login,
	firstLogin,
	getUserProfile,
	recoverPassword,
	resetPassword,
	logout,
} from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 10,
	standardHeaders: true,
	legacyHeaders: false,
	message: { error: "Demasiadas tentativas. Tente novamente mais tarde." },
});

router.post("/login", authLimiter, login);
router.post("/first-login", authMiddleware, firstLogin);
router.post("/recover-password", authLimiter, recoverPassword);
router.post("/reset-password", authLimiter, resetPassword);
router.post("/logout", authMiddleware, logout);
router.get("/me", authMiddleware, getUserProfile);

export default router;
