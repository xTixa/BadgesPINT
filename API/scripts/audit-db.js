import dotenv from "dotenv";
import database from "../src/config/database.js";
import "../src/models/index.js";

dotenv.config();

const query = (sql, replacements = {}) =>
  database.query(sql, { replacements, type: "SELECT" });

async function count(table) {
  const rows = await query(`SELECT COUNT(*)::int AS count FROM ${table}`);
  return rows[0]?.count || 0;
}

async function main() {
  const summary = {
    users: await count('"Users"'),
    learning_paths: await count("learning_paths"),
    service_lines: await count("service_lines"),
    areas: await count("areas"),
    badges: await count("badges"),
    requirements: await count("requirements"),
    consultor_badges: await count("consultor_badges"),
    requirement_evidences: await count("requirement_evidences"),
  };

  console.log("\nResumo");
  console.table(summary);

  const checks = {
    badges_sem_imagem: await query(`
      SELECT id, description, level, area_id
      FROM badges
      WHERE image_url IS NULL OR trim(image_url) = ''
      ORDER BY id
    `),
    badges_sem_requisitos: await query(`
      SELECT b.id, b.description, b.level
      FROM badges b
      LEFT JOIN requirements r ON r.badge_id = b.id
      GROUP BY b.id, b.description, b.level
      HAVING COUNT(r.id) = 0
      ORDER BY b.id
    `),
    users_com_area_invalida: await query(`
      SELECT u.id, u.name, u.email, u.role, u.area_id
      FROM "Users" u
      LEFT JOIN areas a ON a.id = u.area_id
      WHERE u.area_id IS NOT NULL AND a.id IS NULL
      ORDER BY u.id
    `),
    service_line_leaders_sem_area: await query(`
      SELECT id, name, email, role, area_id
      FROM "Users"
      WHERE role = 'service_line_leader' AND area_id IS NULL
      ORDER BY id
    `),
  };

  console.log("\nProblemas encontrados");
  for (const [name, rows] of Object.entries(checks)) {
    console.log(`\n${name}: ${rows.length}`);
    if (rows.length) console.table(rows);
  }

  await database.close();
}

main().catch(async (error) => {
  console.error("Erro na auditoria da BD:", error);
  await database.close();
  process.exit(1);
});
