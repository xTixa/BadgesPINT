import express from "express";
import db from "../config/database.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Backend a funcionar" });
});

router.get("/database", async (req, res) => {
  try {
    await db.authenticate();
    res.json({ message: "Ligação ao PostgreSQL bem sucedida" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao conectar DB", error });
  }
});

export default router;
