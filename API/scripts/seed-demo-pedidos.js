/**
 * seed-demo-pedidos.js
 * Cria candidaturas de badge em vários estados para demo/teste.
 * Garante que dashboards, históricos e relatórios mostram dados reais.
 *
 * Estados criados:
 *  - open         → consultor criou pedido, ainda não submeteu
 *  - submitted    → submetido, aguarda Talent Manager
 *  - em_validacao → TM validou, aguarda Service Line Leader
 *  - fechado/obtido   → aprovado e badge obtido (com certificado)
 *  - fechado/rejeitado → rejeitado pelo SL
 *
 * Uso: npm run seed:demo-pedidos
 */

import dotenv from "dotenv";
dotenv.config();

import { randomBytes } from "crypto";
import database from "../src/config/database.js";
import "../src/models/index.js";
import User from "../src/models/User.js";
import Badge from "../src/models/Badge.js";
import ConsultorBadge from "../src/models/ConsultorBadge.js";
import Area from "../src/models/Area.js";

// Número de pedidos por estado
const CONFIG = {
  open:         4,
  submitted:    6,
  em_validacao: 6,
  obtido:      12,
  rejeitado:    4,
};

const TM_COMMENTS = [
  "Evidências verificadas e aprovadas.",
  "Bom trabalho, requisitos cumpridos.",
  "Avaliação positiva, segue para aprovação final.",
  "Documentação completa e adequada.",
];

const SL_APPROVE_COMMENTS = [
  "Badge concedido. Excelente desempenho.",
  "Aprovado. Continua o bom trabalho.",
  "Competências demonstradas com sucesso.",
  "Badge atribuído com mérito.",
];

const SL_REJECT_COMMENTS = [
  "Evidências insuficientes para este nível. Reformula e resubmete.",
  "Necessário completar mais horas de formação antes de resubmeter.",
  "Critérios não totalmente cumpridos. Consulta o TM para orientação.",
];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function certCode() {
  return randomBytes(16).toString("hex").toUpperCase();
}

// Retorna o TM e SL Leader da mesma service line que o consultor (via área)
async function getValidatorsForConsultor(consultor) {
  if (!consultor.area_id) return { tm: null, sl: null };

  const area = await Area.findByPk(consultor.area_id);
  if (!area) return { tm: null, sl: null };

  // TM na mesma service line (área com mesmo service_line_id)
  const areasOfSL = await Area.findAll({ where: { service_line_id: area.service_line_id } });
  const areaIds = areasOfSL.map((a) => a.id);

  const tm = await User.findOne({
    where: { role: "talent_manager", area_id: areaIds },
  });

  const sl = await User.findOne({
    where: { role: "service_line_leader", area_id: areaIds },
  });

  return { tm, sl };
}

async function main() {
  try {
    await database.authenticate();
    console.log("✔ Base de dados ligada\n");

    const consultores = await User.findAll({
      where: { role: "consultant" },
      order: database.random(),
    });

    const badges = await Badge.findAll({ order: database.random() });

    if (consultores.length === 0 || badges.length === 0) {
      console.error("✖ Sem consultores ou badges. Corre antes: seed:complete-badges e seed:users");
      process.exit(1);
    }

    let created = 0;
    let skipped = 0;
    let consultorIdx = 0;

    const nextConsultor = () => {
      const c = consultores[consultorIdx % consultores.length];
      consultorIdx++;
      return c;
    };

    const nextBadge = (usedBadgeIds = []) => {
      const available = badges.filter((b) => !usedBadgeIds.includes(b.id));
      if (available.length === 0) return randomFrom(badges);
      return randomFrom(available);
    };

    // Rastreia pares (consultor, badge) já usados para não duplicar
    const existingPairs = new Set(
      (await ConsultorBadge.findAll({ attributes: ["consultor_id", "badge_id"] }))
        .map((cb) => `${cb.consultor_id}:${cb.badge_id}`)
    );

    const tryCreate = async (attrs) => {
      const key = `${attrs.consultor_id}:${attrs.badge_id}`;
      if (existingPairs.has(key)) { skipped++; return; }
      existingPairs.add(key);
      await ConsultorBadge.create(attrs);
      created++;
    };

    // ── open ─────────────────────────────────────────────────────────────────
    console.log("── open ────────────────────────────────────────────────────────");
    for (let i = 0; i < CONFIG.open; i++) {
      const c = nextConsultor();
      const b = nextBadge();
      await tryCreate({
        consultor_id:    c.id,
        badge_id:        b.id,
        status:          "pendente",
        workflow_status: "open",
        created_at:      daysAgo(Math.floor(Math.random() * 14) + 1),
      });
      if (created > 0) console.log(`  [+] open        ${c.name} → ${b.description}`);
    }

    // ── submitted ─────────────────────────────────────────────────────────────
    console.log("── submitted ───────────────────────────────────────────────────");
    for (let i = 0; i < CONFIG.submitted; i++) {
      const c = nextConsultor();
      const b = nextBadge();
      const submittedAt = daysAgo(Math.floor(Math.random() * 10) + 2);
      await tryCreate({
        consultor_id:    c.id,
        badge_id:        b.id,
        status:          "pendente",
        workflow_status: "submitted",
        submitted_at:    submittedAt,
        created_at:      new Date(submittedAt.getTime() - 3600000),
      });
      console.log(`  [+] submitted   ${c.name} → ${b.description}`);
    }

    // ── em_validacao ──────────────────────────────────────────────────────────
    console.log("── em_validacao ────────────────────────────────────────────────");
    for (let i = 0; i < CONFIG.em_validacao; i++) {
      const c = nextConsultor();
      const b = nextBadge();
      const { tm } = await getValidatorsForConsultor(c);
      const submittedAt    = daysAgo(Math.floor(Math.random() * 8) + 3);
      const tmValidatedAt  = new Date(submittedAt.getTime() + 86400000);
      await tryCreate({
        consultor_id:     c.id,
        badge_id:         b.id,
        status:           "pendente",
        workflow_status:  "em_validacao",
        submitted_at:     submittedAt,
        tm_validator_id:  tm?.id ?? null,
        tm_validated_at:  tmValidatedAt,
        tm_comment:       randomFrom(TM_COMMENTS),
        created_at:       new Date(submittedAt.getTime() - 3600000),
      });
      console.log(`  [+] em_validacao ${c.name} → ${b.description}`);
    }

    // ── obtido ────────────────────────────────────────────────────────────────
    console.log("── obtido ──────────────────────────────────────────────────────");
    for (let i = 0; i < CONFIG.obtido; i++) {
      const c = nextConsultor();
      const b = nextBadge();
      const { tm, sl } = await getValidatorsForConsultor(c);
      const submittedAt   = daysAgo(Math.floor(Math.random() * 60) + 10);
      const tmValidatedAt = new Date(submittedAt.getTime() + 86400000 * 2);
      const slValidatedAt = new Date(tmValidatedAt.getTime() + 86400000 * 1);
      const expiry = b.expiry_days
        ? new Date(slValidatedAt.getTime() + b.expiry_days * 86400000)
        : null;

      await tryCreate({
        consultor_id:     c.id,
        badge_id:         b.id,
        status:           "obtido",
        workflow_status:  "fechado",
        submitted_at:     submittedAt,
        tm_validator_id:  tm?.id ?? null,
        tm_validated_at:  tmValidatedAt,
        tm_comment:       randomFrom(TM_COMMENTS),
        sl_validator_id:  sl?.id ?? null,
        sl_validated_at:  slValidatedAt,
        sl_comment:       randomFrom(SL_APPROVE_COMMENTS),
        data_atribuicao:  slValidatedAt,
        certificate_code: certCode(),
        created_at:       new Date(submittedAt.getTime() - 7200000),
      });

      // Actualiza pontos do consultor
      if (b.points) {
        await User.increment("points_total", { by: b.points, where: { id: c.id } });
      }

      console.log(`  [+] obtido      ${c.name} → ${b.description} (+${b.points || 0}pts)`);
    }

    // ── rejeitado ────────────────────────────────────────────────────────────
    console.log("── rejeitado ───────────────────────────────────────────────────");
    for (let i = 0; i < CONFIG.rejeitado; i++) {
      const c = nextConsultor();
      const b = nextBadge();
      const { tm, sl } = await getValidatorsForConsultor(c);
      const submittedAt   = daysAgo(Math.floor(Math.random() * 30) + 5);
      const tmValidatedAt = new Date(submittedAt.getTime() + 86400000);
      const slValidatedAt = new Date(tmValidatedAt.getTime() + 86400000);

      await tryCreate({
        consultor_id:    c.id,
        badge_id:        b.id,
        status:          "rejeitado",
        workflow_status: "fechado",
        submitted_at:    submittedAt,
        tm_validator_id: tm?.id ?? null,
        tm_validated_at: tmValidatedAt,
        tm_comment:      randomFrom(TM_COMMENTS),
        sl_validator_id: sl?.id ?? null,
        sl_validated_at: slValidatedAt,
        sl_comment:      randomFrom(SL_REJECT_COMMENTS),
        created_at:      new Date(submittedAt.getTime() - 3600000),
      });
      console.log(`  [+] rejeitado   ${c.name} → ${b.description}`);
    }

    console.log("\n────────────────────────────────────────────────────────────────");
    console.log(`✔ Pedidos criados: ${created}  |  Ignorados (duplicados): ${skipped}`);
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
