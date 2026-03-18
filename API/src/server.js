import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import database from "./config/database.js";
import routes from "./routes/index.js";
import * as models from "./models/index.js";

//import { LearningPath } from "./models/index.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Rotas
app.use("/", routes);

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

// Validar ligação, sincronizar models e iniciar servidor uma única vez
database
  .authenticate()
  .then(() => {
    console.log("Ligação à BD OK");
    return database.sync();
  })
  .then(() => {
    console.log("Models sincronizados com PostgreSQL");
    app.listen(PORT, () => {
      console.log(`Server a correr em http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error("Erro ao iniciar servidor:", err));
