/**
 * seed-users.js
 * Popula a base de dados com consultores, talent managers e service line leaders.
 * Uso: node --experimental-vm-modules API/scripts/seed-users.js
 *   ou: cd API && node scripts/seed-users.js
 *
 * Password padrão de todos os utilizadores criados: Softinsa2025!
 */

import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import database from "../src/config/database.js";
import "../src/models/index.js";
import User from "../src/models/User.js";
import Area from "../src/models/Area.js";
import ServiceLine from "../src/models/ServiceLine.js";

const DEFAULT_PASSWORD = "Softinsa2025!";

// ---------------------------------------------------------------------------
// Nomes portugueses / ibéricos realistas
// ---------------------------------------------------------------------------
const FIRST_NAMES = [
  "Ana", "Beatriz", "Carlos", "Daniela", "Eduardo",
  "Filipa", "Gonçalo", "Helena", "Inês", "João",
  "Karina", "Luís", "Mariana", "Nuno", "Olga",
  "Pedro", "Raquel", "Sérgio", "Teresa", "Vasco",
  "Alexandra", "Bruno", "Catarina", "Diogo", "Elisa",
  "Francisco", "Gabriela", "Hugo", "Isabel", "Jorge",
  "Lara", "Miguel", "Natália", "Osvaldo", "Paula",
  "Ricardo", "Sofia", "Tiago", "Vera", "Xavier",
];

const LAST_NAMES = [
  "Silva", "Santos", "Ferreira", "Pereira", "Costa",
  "Rodrigues", "Martins", "Jesus", "Sousa", "Fernandes",
  "Gonçalves", "Gomes", "Lopes", "Marques", "Alves",
  "Almeida", "Ribeiro", "Pinto", "Carvalho", "Teixeira",
  "Moreira", "Correia", "Mendes", "Neves", "Oliveira",
];

// Mantém controlo de nomes já usados
const usedNames = new Set();
const usedEmails = new Set();

function randomName() {
  let name;
  let tries = 0;
  do {
    const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const last  = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    name = `${first} ${last}`;
    tries++;
  } while (usedNames.has(name) && tries < 200);
  usedNames.add(name);
  return name;
}

function nameToEmail(name, domain = "softinsa.pt") {
  const normalized = name
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, ".");
  let email = `${normalized}@${domain}`;
  let n = 2;
  while (usedEmails.has(email)) {
    email = `${normalized}${n}@${domain}`;
    n++;
  }
  usedEmails.add(email);
  return email;
}

// ---------------------------------------------------------------------------
// Pré-carregar emails existentes para não criar duplicados
// ---------------------------------------------------------------------------
async function loadExistingEmails() {
  const existing = await User.findAll({ attributes: ["email", "name"] });
  for (const u of existing) {
    usedEmails.add(u.email);
    usedNames.add(u.name);
  }
  console.log(`  → ${existing.length} utilizadores já existem na BD`);
}

// ---------------------------------------------------------------------------
// Criar utilizador
// ---------------------------------------------------------------------------
async function createUser({ name, email, role, area_id }) {
  const password_hash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  const [user, created] = await User.findOrCreate({
    where: { email },
    defaults: {
      name,
      email,
      password_hash,
      role,
      area_id,
      rgpd_publication_accepted: true,
      public_profile_enabled: true,
      linkedin_sharing_enabled: true,
      points_total: role === "consultant" ? Math.floor(Math.random() * 350) : 0,
    },
  });
  return { user, created };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  try {
    await database.authenticate();
    console.log("✔ Base de dados ligada\n");

    await loadExistingEmails();

    // Carregar estrutura existente
    const serviceLines = await ServiceLine.findAll({ order: [["id", "ASC"]] });
    const areas = await Area.findAll({ order: [["id", "ASC"]] });

    if (serviceLines.length === 0) {
      console.error("✖ Sem service lines na BD. Corre primeiro o seed de badges.");
      process.exit(1);
    }

    console.log(`\n  Service Lines encontradas: ${serviceLines.map(sl => sl.name).join(", ")}`);
    console.log(`  Áreas encontradas: ${areas.length}\n`);

    // Agrupar áreas por service_line_id
    const areasBySL = {};
    for (const area of areas) {
      if (!areasBySL[area.service_line_id]) areasBySL[area.service_line_id] = [];
      areasBySL[area.service_line_id].push(area);
    }

    let createdCount = 0;
    let skippedCount = 0;

    const log = ({ user, created }, role) => {
      if (created) {
        console.log(`  [+] ${role.padEnd(22)} ${user.name.padEnd(28)} ${user.email}`);
        createdCount++;
      } else {
        skippedCount++;
      }
    };

    // -----------------------------------------------------------------------
    // SERVICE LINE LEADERS — 1 por Service Line (máx 2 se SL tiver muitas áreas)
    // -----------------------------------------------------------------------
    console.log("── Service Line Leaders ────────────────────────────────────────");
    for (const sl of serviceLines) {
      const slAreas = areasBySL[sl.id] || [];
      if (slAreas.length === 0) continue;

      const areaIds = slAreas.map((a) => a.id);
      const targetCount = slAreas.length >= 4 ? 2 : 1;
      const existingCount = await User.count({ where: { role: "service_line_leader", area_id: areaIds } });

      for (let i = existingCount; i < targetCount; i++) {
        const name = randomName();
        const areaForThis = i === 0 ? slAreas[0].id : slAreas[Math.floor(slAreas.length / 2)].id;
        const r = await createUser({
          name,
          email: nameToEmail(name),
          role: "service_line_leader",
          area_id: areaForThis,
        });
        log(r, "service_line_leader");
      }
    }

    // -----------------------------------------------------------------------
    // TALENT MANAGERS — distribuídos pelas service lines
    // -----------------------------------------------------------------------
    console.log("\n── Talent Managers ─────────────────────────────────────────────");
    for (const sl of serviceLines) {
      const slAreas = areasBySL[sl.id] || [];
      if (slAreas.length === 0) continue;

      const areaIds = slAreas.map((a) => a.id);
      const targetCount = Math.min(2, slAreas.length);
      const existingCount = await User.count({ where: { role: "talent_manager", area_id: areaIds } });

      for (let i = existingCount; i < targetCount; i++) {
        const name = randomName();
        const r = await createUser({
          name,
          email: nameToEmail(name),
          role: "talent_manager",
          area_id: slAreas[i % slAreas.length].id,
        });
        log(r, "talent_manager");
      }
    }

    // -----------------------------------------------------------------------
    // CONSULTORES — garante um mínimo de 5 consultores em cada área
    // -----------------------------------------------------------------------
    console.log("\n── Consultores ─────────────────────────────────────────────────");
    const minPorArea = 5;

    for (const area of areas) {
      const existentesNaArea = await User.count({ where: { role: "consultant", area_id: area.id } });
      const emFalta = minPorArea - existentesNaArea;
      if (emFalta <= 0) continue;

      for (let i = 0; i < emFalta; i++) {
        const name = randomName();
        const r = await createUser({
          name,
          email: nameToEmail(name),
          role: "consultant",
          area_id: area.id,
        });
        log(r, "consultant");
      }
    }

    // -----------------------------------------------------------------------
    // Resumo
    // -----------------------------------------------------------------------
    console.log("\n────────────────────────────────────────────────────────────────");
    console.log(`✔ Criados: ${createdCount} utilizadores`);
    if (skippedCount > 0) console.log(`  Ignorados (já existiam): ${skippedCount}`);
    console.log(`\n  Password de todos os utilizadores criados: ${DEFAULT_PASSWORD}`);
    console.log("────────────────────────────────────────────────────────────────\n");

  } catch (err) {
    console.error("\n✖ Erro:", err.message);
    console.error(err.stack);
    process.exit(1);
  } finally {
    await database.close();
  }
}

main();
