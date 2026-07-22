import dotenv from "dotenv";
import database from "../src/config/database.js";
import "../src/models/index.js";
import Badge from "../src/models/Badge.js";
import Requirement from "../src/models/Requirement.js";

dotenv.config();

const badgesToCreate = [
  {
    area_id: 10,
    level: "Senior",
    description: "Advanced Database Optimization",
    points: 200,
    expiry_days: 365,
    image_url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
    requirements: [
      {
        code: "ADO1",
        description: "Analyze and optimize slow queries",
      },
      {
        code: "ADO2",
        description: "Implement effective indexing strategy",
      },
      {
        code: "ADO3",
        description: "Document performance improvements",
      },
      {
        code: "ADO4",
        description: "Present optimization results to team",
      },
    ],
  },
  {
    area_id: 10,
    level: "Intermedio",
    description: "Kubernetes Container Orchestration",
    points: 120,
    expiry_days: 365,
    image_url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80",
    requirements: [
      {
        code: "KCO1",
        description: "Deploy application on Kubernetes cluster",
      },
      {
        code: "KCO2",
        description: "Configure persistent storage and networking",
      },
      {
        code: "KCO3",
        description: "Implement health checks and auto-scaling",
      },
      {
        code: "KCO4",
        description: "Validate setup with peer review",
      },
    ],
  },
  {
    area_id: 10,
    level: "Junior",
    description: "Security & Compliance Fundamentals",
    points: 80,
    expiry_days: 365,
    image_url: "https://images.unsplash.com/photo-1516321318423-f06f70259ce1?auto=format&fit=crop&w=1200&q=80",
    requirements: [
      {
        code: "SCF1",
        description: "Complete security awareness training",
      },
      {
        code: "SCF2",
        description: "Identify and report security vulnerabilities",
      },
      {
        code: "SCF3",
        description: "Document compliance requirements for your project",
      },
      {
        code: "SCF4",
        description: "Get sign-off from security team",
      },
    ],
  },
];

async function seedBadges() {
  try {
    console.log("🚀 Iniciando seed de 3 badges de teste...");

    for (const badgeData of badgesToCreate) {
      console.log(`\n📝 Criando badge: ${badgeData.description} (${badgeData.level})`);

      // Criar badge
      const badge = await Badge.create({
        area_id: badgeData.area_id,
        level: badgeData.level,
        description: badgeData.description,
        points: badgeData.points,
        expiry_days: badgeData.expiry_days,
        image_url: badgeData.image_url,
      });

      console.log(`✅ Badge criado com ID: ${badge.id}`);

      // Criar requirements
      for (const req of badgeData.requirements) {
        await Requirement.create({
          badge_id: badge.id,
          code: req.code,
          description: req.description,
        });
        console.log(`   ✓ Requisito ${req.code} adicionado`);
      }
    }

    console.log("\n✨ Seed completado com sucesso!");
    console.log("\n📊 Resumo dos badges criados:");
    console.log("   1. Advanced Database Optimization (Senior) - 200 pontos");
    console.log("   2. Kubernetes Container Orchestration (Intermedio) - 120 pontos");
    console.log("   3. Security & Compliance Fundamentals (Junior) - 80 pontos");

    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao executar seed:", error);
    process.exit(1);
  }
}

seedBadges();
