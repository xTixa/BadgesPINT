import express from "express";
import { getServiceLinesByLP } from "../controllers/ServiceLineController.js";

const router = express.Router();

router.get("/:id/service-lines", getServiceLinesByLP); // id = learning_path id

export default router;
