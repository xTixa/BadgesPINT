import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import database from "./config/database.js";
import routes from "./routes/index.js";

import { LearningPath } from "./models/index.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Rotas
app.use("/", routes);

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

// Sincronizar models e iniciar servidor
database.sync()
  .then(() => {
    console.log("Models sincronizados com PostgreSQL");
    app.listen(PORT, () => {
      console.log(`Server a correr em http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error("Erro ao sincronizar DB:", err));

  ```
GET http://localhost:4000/
GET http://localhost:4000/learning-paths                    -> lista learning paths
GET http://localhost:4000/learning-paths/:id/service-lines
GET http://localhost:4000/service-lines/:id/areas
GET http://localhost:4000/areas/:id/badges
GET http://localhost:4000/badges/:id/requirements
```