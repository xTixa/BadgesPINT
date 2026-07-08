import express from "express";
import {
  getAreasByServiceLine,
  getAllAreas,
  getAreaById,
  createArea,
  updateArea,
  deleteArea,
} from "../controllers/AreaController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/api/areas", getAllAreas); // Todas as áreas
router.get("/service-lines/:id/areas", getAreasByServiceLine); // id = service line id
router.get("/api/areas/:id", getAreaById);
router.post("/api/areas", protect(["admin"]), createArea);
router.put("/api/areas/:id", protect(["admin"]), updateArea);
router.delete("/api/areas/:id", protect(["admin"]), deleteArea);

export default router;
