import { Router } from "express";
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

router.post("/login", login);
router.post("/first-login", authMiddleware, firstLogin);
router.post("/recover-password", recoverPassword);
router.post("/reset-password", resetPassword);
router.post("/logout", authMiddleware, logout);
router.get("/me", authMiddleware, getUserProfile);

export default router;
