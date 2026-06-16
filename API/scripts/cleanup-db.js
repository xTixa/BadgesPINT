import dotenv from "dotenv";
import database from "../src/config/database.js";

dotenv.config();

async function main() {
  const [result] = await database.query(
    'UPDATE "Users" SET area_id = NULL WHERE area_id = 0',
  );
  console.log("Invalid user area_id=0 normalized.");
  console.log(result);
  await database.close();
}

main().catch(async (error) => {
  console.error("Erro na limpeza da BD:", error);
  await database.close();
  process.exit(1);
});
