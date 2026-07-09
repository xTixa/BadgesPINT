import dotenv from "dotenv";
import database from "../src/config/database.js";

dotenv.config();

const frontendUrl = (
  process.env.FRONTEND_URL ||
  process.env.APP_BASE_URL ||
  "http://localhost:5173"
).replace(/\/$/, "");

const slugByArea = new Map([
  ["API & Integration", "api-integration"],
  ["Advanced Analytics", "advanced-analytics"],
  ["Agile Delivery", "agile-delivery"],
  ["Artificial Intelligence", "artificial-intelligence"],
  ["Azure Administration", "azure-administration"],
  ["Cloud & DevOps", "cloud-devops"],
  ["Competency & Talent Growth", "talent-growth"],
  ["Cybersecurity", "cybersecurity"],
  ["Data Engineering", "data-engineering"],
  ["Data Strategy", "data-strategy"],
  ["Data Visualization", "data-visualization"],
  ["Databases", "databases"],
  ["DevOps & CI/CD", "devops-cicd"],
  ["IT Automation & IaC", "automation-iac"],
  ["Inovação & Transformação Digital - SL1", "tech-innovation-sl1"],
  ["Inovação & Transformação Digital - SL2", "tech-innovation-sl2"],
  ["Mobile Development", "mobile-development"],
  ["Onboarding & Boas Praticas", "onboarding-boas-praticas"],
  ["Quality Assurance", "quality-assurance"],
  ["Tech Recruitment", "tech-recruitment"],
  ["VMware & Virtualization", "vmware-virtualization"],
  ["Web Development", "web-development"],
]);

async function main() {
  const badges = await database.query(
    `SELECT b.id, b.level, a.name AS area
     FROM badges b
     JOIN areas a ON a.id = b.area_id
     ORDER BY b.id`,
    { type: "SELECT" },
  );

  let updated = 0;
  for (const badge of badges) {
    const slug = slugByArea.get(badge.area);
    if (!slug) continue;

    const filename = `${slug}-${String(badge.level).toLowerCase()}.svg`;

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
