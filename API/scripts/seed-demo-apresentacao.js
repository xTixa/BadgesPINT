/**
 * seed-demo-apresentacao.js
 * Prepara os dados para a demo ao vivo com os utilizadores fixos:
 *   admin@example.com            (admin)
 *   carlos.fernandes@yopmail.com (service_line_leader)
 *   natalia.neves@yopmail.com    (talent_manager)
 *   guilherme@yopmail.com        (consultant)
 *
 * O que faz:
 *  1. Garante que Carlos e Natália ficam com area_id = área do Guilherme
 *     ("Cloud & DevOps"), para que vejam os pedidos dele nos respetivos
 *     dashboards (TM é scoped à área exata; SLL é scoped à service line).
 *  2. Garante 2 badges adicionais nessa área (Especialista, Lider) para
 *     ter 5 badges distintos — um por cenário — já que o mesmo consultor
 *     não pode ter 2 pedidos ativos para o mesmo badge.
 *  3. Cria os 5 cenários de workflow pedidos:
 *     (a) pendente, a aguardar o Talent Manager        → Cloud Foundations
 *     (b) aprovado (TM + SLL), badge obtido             → Docker & CI/CD
 *     (c) rejeitado pelo Service Line Leader             → Kubernetes Ops
 *     (d) validado pelo TM, a aguardar o SLL             → Especialista
 *     (e) devolvido ao consultor para rever evidências   → Lider
 *
 * Uso: node scripts/seed-demo-apresentacao.js
 */

import dotenv from "dotenv";
dotenv.config();

import { randomBytes } from "crypto";
import database from "../src/config/database.js";
import "../src/models/index.js";
import User from "../src/models/User.js";
import Area from "../src/models/Area.js";
import Badge from "../src/models/Badge.js";
import Requirement from "../src/models/Requirement.js";
import ConsultorBadge from "../src/models/ConsultorBadge.js";
import RequirementEvidence from "../src/models/RequirementEvidence.js";

const EMAILS = {
  admin: "admin@example.com",
  sll: "carlos.fernandes@yopmail.com",
  tm: "natalia.neves@yopmail.com",
  consultor: "guilherme@yopmail.com",
};

const AREA_NAME = "Cloud & DevOps";

function daysAgo(n, hoursAgo = 0) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(d.getHours() - hoursAgo);
  return d;
}

function certCode() {
  return randomBytes(18).toString("base64url");
}

function fakeEvidenceUrl(consultorId, requirementId, tag) {
  return `https://res.cloudinary.com/demo/raw/upload/evidencias/demo-${tag}-${consultorId}-${requirementId}.pdf`;
}

async function ensureBadgeWithRequirements(area, level, description, points, requirementDefs) {
  let badge = await Badge.findOne({ where: { area_id: area.id, level, description } });
  if (!badge) {
    badge = await Badge.create({
      area_id: area.id,
      level,
      description,
      points,
      published: true,
    });
    console.log(`  [+] Badge criado: ${description} (${level})`);
  } else {
    console.log(`  [=] Badge já existe: ${description} (${level})`);
  }

  const existingReqs = await Requirement.findAll({ where: { badge_id: badge.id } });
  if (existingReqs.length === 0) {
    const formatted = requirementDefs.map((r) => ({ ...r, badge_id: badge.id }));
    await Requirement.bulkCreate(formatted);
    console.log(`      + ${formatted.length} requisitos criados`);
  }

  const requirements = await Requirement.findAll({ where: { badge_id: badge.id }, order: [["code", "ASC"]] });
  return { badge, requirements };
}

async function createEvidences(consultorId, badgeId, requirements, statusFor, tag) {
  const rows = [];
  for (const req of requirements) {
    const status = statusFor(req);
    const existing = await RequirementEvidence.findOne({
      where: { consultor_id: consultorId, requirement_id: req.id },
    });
    if (existing) {
      rows.push(existing);
      continue;
    }
    const row = await RequirementEvidence.create({
      consultor_id: consultorId,
      requirement_id: req.id,
      badge_id: badgeId,
      status,
      evidence_url: fakeEvidenceUrl(consultorId, req.id, tag),
      notes: "Evidência de demonstração para a apresentação.",
    });
    rows.push(row);
  }
  return rows;
}

async function ensureConsultorBadge(consultorId, badgeId, attrs) {
  const existing = await ConsultorBadge.findOne({ where: { consultor_id: consultorId, badge_id: badgeId } });
  if (existing) {
    console.log(`      [=] Pedido já existe para badge ${badgeId} (id=${existing.id}), a atualizar estado...`);
    await existing.update(attrs);
    return existing;
  }
  return ConsultorBadge.create({ consultor_id: consultorId, badge_id: badgeId, ...attrs });
}

async function main() {
  try {
    await database.authenticate();
    console.log("✔ Base de dados ligada\n");

    const [admin, sll, tm, consultor] = await Promise.all([
      User.findOne({ where: { email: EMAILS.admin } }),
      User.findOne({ where: { email: EMAILS.sll } }),
      User.findOne({ where: { email: EMAILS.tm } }),
      User.findOne({ where: { email: EMAILS.consultor } }),
    ]);

    for (const [label, user] of Object.entries({ admin, sll, tm, consultor })) {
      if (!user) {
        console.error(`✖ Utilizador não encontrado: ${EMAILS[label]}. Corre primeiro os seeds base.`);
        process.exit(1);
      }
    }

    const area = await Area.findByPk(consultor.area_id);
    if (!area) {
      console.error(`✖ Consultor ${consultor.email} não tem area_id válido.`);
      process.exit(1);
    }
    console.log(`Área de referência: #${area.id} "${area.name}"\n`);

    // 1. Realinhar TM e SLL para a área do consultor -------------------------
    console.log("── Alinhamento de áreas ────────────────────────────────────────");
    if (tm.area_id !== area.id) {
      await tm.update({ area_id: area.id });
      console.log(`  [~] ${tm.email} (TM): area_id → ${area.id} (${area.name})`);
    } else {
      console.log(`  [=] ${tm.email} (TM) já está na área ${area.id}`);
    }
    if (sll.area_id !== area.id) {
      await sll.update({ area_id: area.id });
      console.log(`  [~] ${sll.email} (SLL): area_id → ${area.id} (${area.name})`);
    } else {
      console.log(`  [=] ${sll.email} (SLL) já está na área ${area.id}`);
    }
    console.log("");

    // 2. Garantir os 5 badges da área (3 existentes + 2 novos) ---------------
    console.log("── Badges da área ───────────────────────────────────────────────");
    const { badge: bJunior, requirements: reqJunior } = await ensureBadgeWithRequirements(
      area, "Junior", "Cloud Foundations", 80, []
    );
    const { badge: bIntermedio, requirements: reqIntermedio } = await ensureBadgeWithRequirements(
      area, "Intermedio", "Docker & CI/CD Practitioner", 120, []
    );
    const { badge: bSenior, requirements: reqSenior } = await ensureBadgeWithRequirements(
      area, "Senior", "Kubernetes Operations", 180, []
    );
    const { badge: bEspecialista, requirements: reqEspecialista } = await ensureBadgeWithRequirements(
      area, "Especialista", "Cloud Architecture Especialista", 240,
      [
        { title: "Desenhar arquitetura multi-cloud", code: "CA1", description: "Propor e documentar uma arquitetura multi-cloud para um cenário real.", image_url: null },
        { title: "Otimizar custos de infraestrutura", code: "CA2", description: "Apresentar um plano de otimização de custos cloud (FinOps).", image_url: null },
        { title: "Definir estratégia de disaster recovery", code: "CA3", description: "Documentar plano de continuidade e recuperação de desastre.", image_url: null },
        { title: "Mentoria técnica a equipa júnior", code: "CA4", description: "Evidenciar sessão de mentoria/formação interna sobre cloud.", image_url: null },
      ]
    );
    const { badge: bLider, requirements: reqLider } = await ensureBadgeWithRequirements(
      area, "Lider", "Cloud Practice Leadership", 300,
      [
        { title: "Liderar iniciativa estratégica de cloud", code: "CL1", description: "Documentar liderança de uma iniciativa estratégica de adoção cloud.", image_url: null },
        { title: "Definir standards da prática", code: "CL2", description: "Criar guidelines/standards adotados pela prática de Cloud & DevOps.", image_url: null },
        { title: "Representar a prática externamente", code: "CL3", description: "Evidenciar participação em conferência, artigo ou parceria externa.", image_url: null },
        { title: "Plano de crescimento da equipa", code: "CL4", description: "Apresentar plano de crescimento de competências da equipa.", image_url: null },
      ]
    );
    console.log("");

    // 3. Cenários de workflow -------------------------------------------------
    console.log("── Cenários de pedidos de badge ─────────────────────────────────");

    // (a) Pendente, a aguardar o Talent Manager — Cloud Foundations
    await createEvidences(consultor.id, bJunior.id, reqJunior, () => "pendente", "a");
    await ensureConsultorBadge(consultor.id, bJunior.id, {
      status: "pendente",
      workflow_status: "submitted",
      submitted_at: daysAgo(1),
      created_at: daysAgo(2),
    });
    console.log(`  (a) PENDENTE (aguarda TM)      → ${bJunior.description}`);

    // (b) Aprovado por TM + SLL — Docker & CI/CD
    await createEvidences(consultor.id, bIntermedio.id, reqIntermedio, () => "aprovado", "b");
    const submittedB = daysAgo(10);
    const tmValidatedB = daysAgo(8);
    const slValidatedB = daysAgo(6);
    const existingIntermedio = await ConsultorBadge.findOne({ where: { consultor_id: consultor.id, badge_id: bIntermedio.id } });
    const wasObtainedIntermedio = existingIntermedio?.status === "obtido";
    await ensureConsultorBadge(consultor.id, bIntermedio.id, {
      status: "obtido",
      workflow_status: "fechado",
      submitted_at: submittedB,
      tm_validator_id: tm.id,
      tm_validated_at: tmValidatedB,
      tm_comment: "Evidências completas e bem documentadas.",
      sl_validator_id: sll.id,
      sl_validated_at: slValidatedB,
      sl_comment: "Aprovado. Excelente domínio de containers e CI/CD.",
      data_atribuicao: slValidatedB,
      certificate_code: certCode(),
    });
    if (!wasObtainedIntermedio && bIntermedio.points) {
      await User.increment("points_total", { by: bIntermedio.points, where: { id: consultor.id } });
    }
    console.log(`  (b) OBTIDO (aprovado TM+SLL)   → ${bIntermedio.description}`);

    // (c) Rejeitado pelo Service Line Leader — Kubernetes Operations
    await createEvidences(consultor.id, bSenior.id, reqSenior, () => "aprovado", "c");
    const submittedC = daysAgo(15);
    const tmValidatedC = daysAgo(13);
    const slValidatedC = daysAgo(11);
    const rejectReason = "Evidências não demonstram autonomia suficiente em operações de produção. Reforça o requisito de gestão de incidentes e resubmete.";
    await ensureConsultorBadge(consultor.id, bSenior.id, {
      status: "rejeitado",
      workflow_status: "fechado",
      submitted_at: submittedC,
      tm_validator_id: tm.id,
      tm_validated_at: tmValidatedC,
      tm_comment: "Validado para decisão final do Service Line Leader.",
      sl_validator_id: sll.id,
      sl_validated_at: slValidatedC,
      sl_comment: rejectReason,
      rejection_reason: rejectReason,
    });
    console.log(`  (c) REJEITADO (pelo SLL)       → ${bSenior.description}`);

    // (d) Validado pelo TM, a aguardar decisão do SLL — Especialista
    await createEvidences(consultor.id, bEspecialista.id, reqEspecialista, () => "aprovado", "d");
    const submittedD = daysAgo(4);
    const tmValidatedD = daysAgo(2);
    await ensureConsultorBadge(consultor.id, bEspecialista.id, {
      status: "pendente",
      workflow_status: "em_validacao",
      submitted_at: submittedD,
      tm_validator_id: tm.id,
      tm_validated_at: tmValidatedD,
      tm_comment: "Validado, aguarda aprovação final do Service Line Leader.",
    });
    console.log(`  (d) EM VALIDAÇÃO (aguarda SLL) → ${bEspecialista.description}`);

    // (e) Devolvido ao consultor para rever evidências — Lider
    await createEvidences(
      consultor.id,
      bLider.id,
      reqLider,
      (req, idx) => (req.code === reqLider[reqLider.length - 1].code ? "rejeitado" : "aprovado"),
      "e"
    );
    const returnReason = "Falta evidência concreta do plano de crescimento da equipa (requisito CL4). Por favor complementa e resubmete.";
    await ensureConsultorBadge(consultor.id, bLider.id, {
      status: "pendente",
      workflow_status: "open",
      submitted_at: null,
      tm_validator_id: tm.id,
      tm_validated_at: daysAgo(3),
      tm_comment: returnReason,
      rejection_reason: returnReason,
    });
    console.log(`  (e) DEVOLVIDO (rever evid.)    → ${bLider.description}`);

    console.log("\n────────────────────────────────────────────────────────────────");
    console.log("✔ Cenários de demo prontos.");
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
