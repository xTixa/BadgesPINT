import dotenv from "dotenv";
import database from "../src/config/database.js";
import "../src/models/index.js";
import Badge from "../src/models/Badge.js";
import BadgeSection from "../src/models/BadgeSection.js";
import BadgeLesson from "../src/models/BadgeLesson.js";

dotenv.config();

function slugify(value) {
  return String(value || "badge")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function levelDifficulty(level) {
  if (level === "Junior") return "Principiante";
  if (level === "Intermedio") return "Intermedio";
  if (level === "Senior") return "Avancado";
  return "Especialista";
}

function curriculumForBadge(badge) {
  const name = badge.description || `Badge ${badge.id}`;
  return [
    {
      title: "Introducao e contexto",
      description: `Visao geral do badge ${name} e das competencias avaliadas.`,
      lessons: [
        {
          title: "Objetivos do badge",
          description: "Perceber o que vais demonstrar e como a validacao funciona.",
          content_type: "article",
          duration_minutes: 8,
          is_preview: true,
        },
        {
          title: "Ferramentas e recursos",
          description: "Preparar ambiente, documentacao e materiais de apoio.",
          content_type: "external",
          duration_minutes: 12,
        },
      ],
    },
    {
      title: "Pratica guiada",
      description: "Atividades praticas alinhadas com os requisitos do badge.",
      lessons: [
        {
          title: "Exercicio principal",
          description: "Executar uma tarefa representativa da competencia certificada.",
          content_type: "exercise",
          duration_minutes: 35,
        },
        {
          title: "Checklist de qualidade",
          description: "Validar boas praticas antes de submeter evidencia.",
          content_type: "article",
          duration_minutes: 10,
        },
      ],
    },
    {
      title: "Submissao e certificacao",
      description: "Preparacao da evidencia final e interpretacao do feedback.",
      lessons: [
        {
          title: "Como submeter evidencia",
          description: "Organizar screenshots, links, relatorios ou ficheiros para aprovacao.",
          content_type: "article",
          duration_minutes: 10,
        },
        {
          title: "Proximos passos",
          description: "Escolher o badge seguinte e manter a certificacao atualizada.",
          content_type: "article",
          duration_minutes: 7,
        },
      ],
    },
  ];
}

async function upsertCurriculum(badge) {
  const existingSections = await BadgeSection.count({ where: { badge_id: badge.id } });
  if (existingSections > 0) return;

  const sections = curriculumForBadge(badge);
  for (const [sectionIndex, section] of sections.entries()) {
    const createdSection = await BadgeSection.create({
      badge_id: badge.id,
      title: section.title,
      description: section.description,
      position: sectionIndex + 1,
    });

    await BadgeLesson.bulkCreate(
      section.lessons.map((lesson, lessonIndex) => ({
        badge_id: badge.id,
        section_id: createdSection.id,
        title: lesson.title,
        description: lesson.description,
        content_type: lesson.content_type,
        content_url: lesson.content_url || null,
        duration_minutes: lesson.duration_minutes,
        is_preview: lesson.is_preview === true,
        position: lessonIndex + 1,
      }))
    );
  }
}

async function main() {
  await database.authenticate();
  await Promise.all([
    database.query("ALTER TABLE badges ADD COLUMN IF NOT EXISTS subtitle TEXT"),
    database.query("ALTER TABLE badges ADD COLUMN IF NOT EXISTS slug VARCHAR(180) UNIQUE"),
    database.query("ALTER TABLE badges ADD COLUMN IF NOT EXISTS learning_outcomes JSONB"),
    database.query("ALTER TABLE badges ADD COLUMN IF NOT EXISTS target_audience JSONB"),
    database.query("ALTER TABLE badges ADD COLUMN IF NOT EXISTS prerequisites JSONB"),
    database.query("ALTER TABLE badges ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 0"),
    database.query("ALTER TABLE badges ADD COLUMN IF NOT EXISTS difficulty VARCHAR(40)"),
    database.query("ALTER TABLE badges ADD COLUMN IF NOT EXISTS language VARCHAR(40) DEFAULT 'pt-PT'"),
    database.query("ALTER TABLE badges ADD COLUMN IF NOT EXISTS instructor_name VARCHAR(150)"),
    database.query("ALTER TABLE badges ADD COLUMN IF NOT EXISTS promo_video_url TEXT"),
    database.query("ALTER TABLE badges ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE"),
    database.query("ALTER TABLE badges ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT TRUE"),
  ]);
  await database.sync();

  const badges = await Badge.findAll({ order: [["id", "ASC"]] });
  for (const badge of badges) {
    const name = badge.description || `Badge ${badge.id}`;
    const duration = Math.max(Number(badge.duration_minutes || 0), 82);
    await badge.update({
      slug: badge.slug || `${slugify(name)}-${badge.id}`,
      subtitle:
        badge.subtitle ||
        `Percurso pratico para demonstrar competencias em ${name}.`,
      learning_outcomes:
        badge.learning_outcomes || [
          `Compreender os fundamentos de ${name}`,
          "Aplicar conhecimentos num desafio pratico",
          "Preparar evidencias claras para validacao",
          "Interpretar feedback e evoluir para o proximo nivel",
        ],
      target_audience:
        badge.target_audience || [
          "Consultores em progressao de carreira",
          "Equipas que precisam de validar competencias tecnicas",
        ],
      prerequisites:
        badge.prerequisites || [
          "Acesso aos materiais internos da area",
          "Ambiente de trabalho configurado",
        ],
      duration_minutes: duration,
      difficulty: badge.difficulty || levelDifficulty(badge.level),
      language: badge.language || "pt-PT",
      instructor_name: badge.instructor_name || "Equipa Softinsa Academy",
      is_featured: badge.is_featured || badge.points >= 100,
      published: badge.published !== false,
    });

    await upsertCurriculum(badge);
  }

  console.log(`Badges enriquecidos: ${badges.length}`);
  await database.close();
}

main().catch(async (error) => {
  console.error("Erro ao enriquecer badges:", error);
  await database.close();
  process.exit(1);
});
