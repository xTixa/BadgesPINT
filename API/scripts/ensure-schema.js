import dotenv from "dotenv";
import database from "../src/config/database.js";

dotenv.config();

async function main() {
  await database.query(`
    ALTER TABLE consultor_badges
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  `);

  await database.query(`
    UPDATE consultor_badges
    SET created_at = COALESCE(created_at, submitted_at, data_atribuicao, NOW())
    WHERE created_at IS NULL
  `);

  console.log("Schema checked.");
  await database.close();
}

main().catch(async (error) => {
  console.error("Erro ao validar schema:", error);
  await database.close();
  process.exit(1);
});
