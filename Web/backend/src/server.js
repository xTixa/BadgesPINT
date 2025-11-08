import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import database from "./config/database.js";
import routes from "./routes/index.js";
import { LearningPath } from "./models/index.js"; // ensure models loaded
dotenv.config();



const app = express();
app.use(cors());
app.use(express.json());

app.use("/", routes);

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

database.authenticate()
  .then(() => console.log("✅ Conectado ao PostgreSQL"))
  .catch((err) => console.error("Erro ao conectar DB:", err));

app.listen(PORT, () => console.log(`Server a correr em http://localhost:${PORT}`));