/**
 * seed-sla.js
 * Cria entradas SLA para todos os Talent Managers e Service Line Leaders existentes.
 * Uso: npm run seed:sla  (dentro da pasta API)
 */

import dotenv from "dotenv";
dotenv.config();

import database from "../src/config/database.js";
import "../src/models/index.js";
import User from "../src/models/User.js";
import SLA from "../src/models/SLA.js";

// Limites de horas por tipo de role
const HOURS = {
  talent_manager:      48, // 2 dias úteis para validar evidências
  service_line_leader: 72, // 3 dias úteis para aprovação final
};

async function main() {
  try {
    await database.authenticate();
    console.log("✔ Base de dados ligada\n");

    const users = await User.findAll({
      where: { role: ["talent_manager", "service_line_leader"] },
      order: [["role", "ASC"], ["name", "ASC"]],
    });

    if (users.length === 0) {
      console.warn("  Nenhum TM ou SL Leader encontrado. Corre primeiro seed:users.");
      return;
    }

    let created = 0;
    let skipped = 0;

    for (const user of users) {
      const team_type =
        user.role === "talent_manager" ? "talent_manager" : "service_line_leader";

      const existing = await SLA.findOne({ where: { team_id: user.id, team_type } });
      if (existing) {
        skipped++;
        continue;
      }

      await SLA.create({
        team_id:              user.id,
        team_type,
        hours_limit:          HOURS[user.role],
        notification_enabled: true,
        email_notification:   true,
        push_notification:    true,
        status:               "active",
      });

      console.log(`  [+] SLA criado  ${team_type.padEnd(22)} ${user.name} (${user.email})`);
      created++;
    }

    console.log(`\n✔ SLAs criados: ${created}  |  Já existiam: ${skipped}\n`);
  } catch (err) {
    console.error("\n✖ Erro:", err.message);
    process.exit(1);
  } finally {
    await database.close();
  }
}

main();
