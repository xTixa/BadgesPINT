import express from "express";
import { getAreasByServiceLine, getAllAreas } from "../controllers/AreaController.js";

const router = express.Router();

router.get("/api/areas", getAllAreas); // Todas as áreas
router.get("/service-lines/:id/areas", getAreasByServiceLine); // id = service line id

export default router;
