import express from "express";
import { getAreasByServiceLine } from "../controllers/AreaController.js";

const router = express.Router();

router.get("/service-lines/:id/areas", getAreasByServiceLine); // id = service line id

export default router;
