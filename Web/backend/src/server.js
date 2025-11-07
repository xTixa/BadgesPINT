import express from "express";
import testRoutes from "./routes/testRoutes.js";
import database from "./config/database.js";
import learningPathRoutes from "./routes/LearningPathRoutes.js";


const app = express();
app.use(express.json());

app.use("/", testRoutes);
app.use("/learning-paths", learningPathRoutes);


const PORT = process.env.PORT || 4000;

database.authenticate()
  .then(() => console.log("Conectado ao PostgreSQL!"))
  .catch((err) => console.error("Erro ao conectar DB:", err));

app.listen(PORT, () =>
  console.log(`Server a rodar com força no http://localhost:${PORT}`)
);
