/**
 * seed-admin.js
 * Cria utilizadores administradores se não existirem.
 * Uso: npm run seed:admin  (dentro da pasta API)
 */

import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import database from "../src/config/database.js";
import "../src/models/index.js";
import User from "../src/models/User.js";

const ADMINS = [
  { name: "Administrador Softinsa", email: "admin@softinsa.pt",   password: "Admin2025!" },
  { name: "Patricia Oliveira",      email: "patricia@softinsa.pt", password: "Admin2025!" },
];

async function main() {
  try {
    await database.authenticate();
    console.log("✔ Base de dados ligada\n");

    for (const admin of ADMINS) {
      const existing = await User.findOne({ where: { email: admin.email } });
      if (existing) {
        console.log(`  [=] Já existe: ${admin.email}`);
        continue;
      }
      const password_hash = await bcrypt.hash(admin.password, 10);
      await User.create({
        name: admin.name,
        email: admin.email,
        password_hash,
        role: "admin",
        area_id: null,
        rgpd_publication_accepted: true,
        public_profile_enabled: false,
        linkedin_sharing_enabled: false,
        points_total: 0,
      });
      console.log(`  [+] Admin criado: ${admin.email}  (password: ${admin.password})`);
    }

    console.log("\n✔ Concluído.\n");
  } catch (err) {
    console.error("\n✖ Erro:", err.message);
    process.exit(1);
  } finally {
    await database.close();
  }
}

main();
