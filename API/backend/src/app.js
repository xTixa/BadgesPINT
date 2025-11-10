import express from "express";
import cors from "cors";
import sequelize from "./src/config/database.js";

const app = express();
app.use(cors());
app.use(express.json());

// rota mínima para teste
app.get("/", (req, res) => {
  res.json({ message: "Backend a funcionar" });
});

// sincronizar models
sequelize.sync()
  .then(() => console.log("Models sincronizados com PostgreSQL"))
  .catch(err => console.error("Erro ao sincronizar DB:", err));

export default app;
