/**
 * seed-demo-evidencias.js
 * Cria evidências de requisitos (requirement_evidences) em vários estados,
 * para testar o mecanismo "B" de atribuição de badge (por requisito).
 *
 * Isto serve sobretudo para reproduzir/testar o bug conhecido:
 *  - finalizeBadgeIfComplete() atribui o badge assim que o Talent Manager
 *    aprova a última evidência pendente de um badge, SEM qualquer aprovação
 *    do Service Line Leader (ver API/src/controllers/evidenceController.js).
 *
 * Cenários criados por consultor/badge:
 *  - pendente_parcial   → algumas evidências aprovadas, outras ainda pendentes
 *                         (TM ainda tem trabalho por fazer nesta candidatura)
 *  - pronto_para_ultima → todas as evidências menos uma já aprovadas; a última
 *                         está "pendente" — aprová-la via PUT /api/tm/evidencias/:id/aprovar
 *                         dispara finalizeBadgeIfComplete() e atribui o badge
 *                         imediatamente, sem passar pelo Service Line Leader.
 *  - todas_aprovadas    → todas as evidências já aprovadas (badge já devia estar "obtido")
 *  - com_rejeitada      → mistura de aprovadas/rejeitadas (nunca fecha o badge)
 *
 * Uso: npm run seed:demo-evidencias
 */

import dotenv from "dotenv";
dotenv.config();

import database from "../src/config/database.js";
import "../src/models/index.js";
import User from "../src/models/User.js";
import Badge from "../src/models/Badge.js";
import Requirement from "../src/models/Requirement.js";
import RequirementEvidence from "../src/models/RequirementEvidence.js";

const NOTES = [
  "Certificado anexado, concluído no Udemy.",
  "Evidência do projeto interno, ver link.",
  "Print da avaliação final do curso.",
  "Documento comprovativo em anexo.",
];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function fakeEvidenceUrl(consultorId, requirementId) {
  return `https://res.cloudinary.com/demo/raw/upload/evidencias/seed-${consultorId}-${requirementId}.pdf`;
}

async function main() {
  try {
    await database.authenticate();
    console.log("✔ Base de dados ligada\n");

    const consultores = await User.findAll({ where: { role: "consultant" } });

    // Só usamos badges que têm pelo menos 2 requisitos, para poder criar
    // o cenário "falta só 1 para completar".
    const badges = await Badge.findAll({
      include: [{ model: Requirement, as: "requirements" }],
    });
    const badgesComRequisitos = badges.filter((b) => (b.requirements || []).length >= 2);

    if (consultores.length === 0 || badgesComRequisitos.length === 0) {
      console.error(
        "✖ Sem consultores ou badges com >=2 requisitos. Corre antes: seed:complete-badges e seed:users"
      );
      process.exit(1);
    }

    let created = 0;
    let skipped = 0;
    let consultorIdx = 0;
    let badgeIdx = 0;

    const nextConsultor = () => {
      const c = consultores[consultorIdx % consultores.length];
      consultorIdx++;
      return c;
    };

    const nextBadge = () => {
      const b = badgesComRequisitos[badgeIdx % badgesComRequisitos.length];
      badgeIdx++;
      return b;
    };

    const existingPairs = new Set(
      (await RequirementEvidence.findAll({ attributes: ["consultor_id", "requirement_id"] }))
        .map((e) => `${e.consultor_id}:${e.requirement_id}`)
    );

    const tryCreate = async (attrs) => {
      const key = `${attrs.consultor_id}:${attrs.requirement_id}`;
      if (existingPairs.has(key)) {
        skipped++;
        return null;
      }
      existingPairs.add(key);
      const evidence = await RequirementEvidence.create(attrs);
      created++;
      return evidence;
    };

    const baseAttrs = (consultor, requirement, badge, status, ageDays) => ({
      consultor_id: consultor.id,
      requirement_id: requirement.id,
      badge_id: badge.id,
      status,
      evidence_url: fakeEvidenceUrl(consultor.id, requirement.id),
      notes: randomFrom(NOTES),
      created_at: daysAgo(ageDays),
      updated_at: daysAgo(Math.max(ageDays - 1, 0)),
    });

    // ── pendente_parcial: metade aprovada, metade pendente ─────────────────
    console.log("── pendente_parcial ────────────────────────────────────────────");
    for (let i = 0; i < 4; i++) {
      const c = nextConsultor();
      const b = nextBadge();
      const reqs = b.requirements;
      for (let r = 0; r < reqs.length; r++) {
        const status = r % 2 === 0 ? "aprovado" : "pendente";
        await tryCreate(baseAttrs(c, reqs[r], b, status, 10 - r));
      }
      console.log(`  [+] pendente_parcial ${c.name} → ${b.description} (${reqs.length} requisitos)`);
    }

    // ── pronto_para_ultima: só falta 1 requisito aprovar (dispara o bug) ───
    console.log("── pronto_para_ultima (expõe o bug de atribuição sem SLL) ─────");
    for (let i = 0; i < 4; i++) {
      const c = nextConsultor();
      const b = nextBadge();
      const reqs = b.requirements;
      for (let r = 0; r < reqs.length; r++) {
        const isLast = r === reqs.length - 1;
        const status = isLast ? "pendente" : "aprovado";
        await tryCreate(baseAttrs(c, reqs[r], b, status, 7 - r));
      }
      console.log(
        `  [+] pronto_para_ultima ${c.name} → ${b.description} ` +
        `(aprovar a evidência do requisito "${reqs[reqs.length - 1].code}" atribui o badge sem SLL)`
      );
    }

    // ── todas_aprovadas: badge já devia estar fechado ──────────────────────
    console.log("── todas_aprovadas ─────────────────────────────────────────────");
    for (let i = 0; i < 3; i++) {
      const c = nextConsultor();
      const b = nextBadge();
      const reqs = b.requirements;
      for (const req of reqs) {
        await tryCreate(baseAttrs(c, req, b, "aprovado", 20));
      }
      console.log(`  [+] todas_aprovadas ${c.name} → ${b.description}`);
    }

    // ── com_rejeitada: mistura, nunca fecha ────────────────────────────────
    console.log("── com_rejeitada ───────────────────────────────────────────────");
    for (let i = 0; i < 3; i++) {
      const c = nextConsultor();
      const b = nextBadge();
      const reqs = b.requirements;
      for (let r = 0; r < reqs.length; r++) {
        const status = r === 0 ? "rejeitado" : "aprovado";
        await tryCreate(baseAttrs(c, reqs[r], b, status, 15 - r));
      }
      console.log(`  [+] com_rejeitada ${c.name} → ${b.description}`);
    }

    console.log("\n────────────────────────────────────────────────────────────────");
    console.log(`✔ Evidências criadas: ${created}  |  Ignoradas (duplicadas): ${skipped}`);
    console.log("────────────────────────────────────────────────────────────────");
    console.log(
      "\nPara reproduzir o bug: faz login como talent_manager, vai a " +
      "ValidarEvidencias, e aprova a última evidência pendente de um dos " +
      "badges 'pronto_para_ultima'. Confirma em consultor_badges que o " +
      "'status' fica 'obtido' com sl_validator_id = NULL.\n"
    );
  } catch (err) {
    console.error("\n✖ Erro:", err.message);
    console.error(err.stack);
    process.exit(1);
  } finally {
    await database.close();
  }
}

main();
