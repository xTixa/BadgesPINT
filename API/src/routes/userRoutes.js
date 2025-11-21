import { Router } from "express";
import { getAllUsers, registerConsultant } from "../controllers/userController.js";

const router = Router();

router.get("/", getAllUsers);
router.post("/register", registerConsultant);

export default router;
