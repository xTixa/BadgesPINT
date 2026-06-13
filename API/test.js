import database from "./src/config/database.js";

try {
  await database.authenticate();
  console.log("✅ Ligação ao Neon bem sucedida!");
} catch (error) {
  console.error("❌ Erro na ligação:", error.message);
}

process.exit(0);