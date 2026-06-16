import dotenv from "dotenv";
import database from "../src/config/database.js";

dotenv.config();

const frontendUrl = (
  process.env.FRONTEND_URL ||
  process.env.APP_BASE_URL ||
  "http://localhost:5173"
).replace(/\/$/, "");

const imageByArea = new Map([
  ["Azure Administration", "azure-administration.svg"],
  ["VMware & Virtualization", "vmware-virtualization.svg"],
  ["DevOps & CI/CD", "devops-cicd.svg"],
  ["IT Automation & IaC", "automation-iac.svg"],
  ["Tech Recruitment", "tech-recruitment.svg"],
  ["Competency & Talent Growth", "talent-growth.svg"],
]);

async function main() {
  const badges = await database.query(
    `SELECT b.id, a.name AS area
     FROM badges b
     JOIN areas a ON a.id = b.area_id
     ORDER BY b.id`,
    { type: "SELECT" },
  );

  let updated = 0;
  for (const badge of badges) {
    const filename = imageByArea.get(badge.area);
    if (!filename) continue;

    await database.query(
      "UPDATE badges SET image_url = :imageUrl WHERE id = :id",
      {
        replacements: {
          id: badge.id,
          imageUrl: `${frontendUrl}/badges/${filename}`,
        },
      },
    );
    updated += 1;
  }

  console.log(`Badge images updated: ${updated}`);
  await database.close();
}

main().catch(async (error) => {
  console.error("Erro ao preencher imagens dos badges:", error);
  await database.close();
  process.exit(1);
});
