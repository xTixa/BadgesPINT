import User from "../models/User.js";
import Badge from "../models/Badge.js";
import ConsultorBadge from "../models/ConsultorBadge.js";
import Area from "../models/Area.js";
import Requirement from "../models/Requirement.js";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import database from "../config/database.js";
import { QueryTypes, fn, col, Op } from "sequelize";

const buildMonthlySeries = (rows, start, end) => {
  const result = [];
  const cursor = new Date(start.getTime());
  cursor.setDate(1);
  const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
  const map = new Map(rows.map((r) => [r.month, Number(r.count) || 0]));
  while (cursor <= endMonth) {
    const label = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
    result.push({ month: label, count: map.get(label) || 0 });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return result;
};

async function getSLAreaIds(userId) {
  const user = await User.findByPk(userId, {
    include: [{ model: Area, as: "area", attributes: ["id", "service_line_id"] }],
  });
  if (!user?.area?.service_line_id) return { user, areaIds: [], serviceLineId: null };
  const areas = await Area.findAll({
    where: { service_line_id: user.area.service_line_id },
    attributes: ["id"],
    raw: true,
  });
  return { user, areaIds: areas.map((area) => area.id), serviceLineId: user.area.service_line_id };
}

function buildFilters(query = {}) {
  const end = query.endDate ? new Date(query.endDate) : new Date();
  const start = query.startDate ? new Date(query.startDate) : new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000);
  if (query.ano) {
    const month = query.mes ? Number(query.mes) - 1 : 0;
    start.setFullYear(Number(query.ano), month, 1);
    start.setHours(0, 0, 0, 0);
    if (query.mes) {
      end.setFullYear(Number(query.ano), month + 1, 0);
    } else {
      end.setFullYear(Number(query.ano), 11, 31);
    }
    end.setHours(23, 59, 59, 999);
  }
  return {
    start,
    end,
    consultor: query.consultor ? `%${query.consultor}%` : null,
    badge: query.badge ? `%${query.badge}%` : null,
  };
}

function normalizeScope(scope) {
  if (scope === "consultores") return "users";
  return scope || "pedidos";
}

async function getReportRows({ areaIds, scope, filters, limit = null }) {
  const normalized = normalizeScope(scope);
  const replacements = {
    areaIds,
    start: filters.start,
    end: filters.end,
    consultor: filters.consultor,
    badge: filters.badge,
    limit,
  };

  if (normalized === "badges") {
    return database.query(
      `SELECT b.id, 'badges' AS tipo, '-' AS consultor, COALESCE(b.description, 'Badge #' || b.id) AS badge,
              b.level AS detalhe, COALESCE(b.points, 0)::text AS pontos, a.name AS area, 'catalogo' AS situacao, NULL::timestamp AS data
       FROM badges b
       LEFT JOIN areas a ON a.id = b.area_id
       WHERE (:badge IS NULL OR COALESCE(b.description, '') ILIKE :badge)
       ORDER BY b.id DESC
       ${limit ? "LIMIT :limit" : ""}`,
      { replacements, type: QueryTypes.SELECT },
    );
  }

  if (normalized === "users") {
    return database.query(
      `SELECT u.id, 'consultores' AS tipo, u.name AS consultor, '-' AS badge, u.email AS detalhe,
              COALESCE(u.points_total, 0)::text AS pontos, a.name AS area, 'ativo' AS situacao, u.created_at AS data
       FROM "Users" u
       LEFT JOIN areas a ON a.id = u.area_id
       WHERE u.role = 'consultant' AND u.area_id IN (:areaIds)
         AND (:consultor IS NULL OR u.name ILIKE :consultor)
       ORDER BY COALESCE(u.points_total, 0) DESC, u.name ASC
       ${limit ? "LIMIT :limit" : ""}`,
      { replacements, type: QueryTypes.SELECT },
    );
  }

  const statusFilter =
    normalized === "aprovacoes"
      ? "AND cb.status = 'obtido'"
      : normalized === "rejeicoes"
        ? "AND cb.status = 'rejeitado'"
        : "";

  return database.query(
    `SELECT cb.id, :scope AS tipo, u.name AS consultor, COALESCE(b.description, 'Badge #' || b.id) AS badge,
            cb.workflow_status AS detalhe, COALESCE(b.points, 0)::text AS pontos, a.name AS area,
            cb.status AS situacao, COALESCE(cb.data_atribuicao, cb.submitted_at, NOW()) AS data,
            cb.tm_comment, cb.sl_comment, cb.rejection_reason
     FROM consultor_badges cb
     JOIN "Users" u ON u.id = cb.consultor_id
     JOIN badges b ON b.id = cb.badge_id
     LEFT JOIN areas a ON a.id = b.area_id
     WHERE u.area_id IN (:areaIds)
      AND COALESCE(cb.submitted_at, cb.data_atribuicao, NOW()) BETWEEN :start AND :end
       AND (:consultor IS NULL OR u.name ILIKE :consultor)
      AND (:badge IS NULL OR COALESCE(b.description, '') ILIKE :badge)
       ${statusFilter}
     ORDER BY data DESC NULLS LAST
     ${limit ? "LIMIT :limit" : ""}`,
    { replacements: { ...replacements, scope: normalized }, type: QueryTypes.SELECT },
  );
}

export async function getSL(req, res) {
  try {
    const sl = await User.findByPk(req.userId);
    res.json(sl);
  } catch (err) {
    console.error("Erro SL:", err);
    res.status(500).json({ message: "Erro no servidor" });
  }
}

export async function getSLEstatisticas(req, res) {
  try {
    const { user: sl, areaIds } = await getSLAreaIds(req.userId);
    if (!sl) return res.status(404).json({ message: "Service Line nao encontrada" });

    const totalConsultores = await User.count({ where: { area_id: areaIds, role: "consultant" } });
    const cursosAtivos = await Badge.count({ where: { area_id: { [Op.in]: areaIds } } });

    const counts = await database.query(
      `SELECT COUNT(cb.id)::int AS total,
              COUNT(cb.id) FILTER (WHERE cb.status = 'obtido')::int AS concluidos,
              COUNT(cb.id) FILTER (WHERE cb.status = 'pendente')::int AS pendentes,
              COUNT(cb.id) FILTER (WHERE cb.workflow_status = 'em_validacao')::int AS aguardam_sl
       FROM consultor_badges cb
       JOIN "Users" u ON u.id = cb.consultor_id
       WHERE u.area_id IN (:areaIds)`,
      { replacements: { areaIds }, type: QueryTypes.SELECT },
    );

    const totalBadges = counts[0]?.total || 0;
    const concluidos = counts[0]?.concluidos || 0;

    res.json({
      totalConsultores,
      cursosAtivos,
      badgesPendentes: counts[0]?.aguardam_sl || 0,
      pedidosPendentesTotal: counts[0]?.pendentes || 0,
      progressoMedio: totalBadges ? Math.round((concluidos / totalBadges) * 100) : 0,
    });
  } catch (err) {
    console.error("Erro estatisticas SL:", err);
    res.status(500).json({ message: "Erro no servidor" });
  }
}

export async function getSLKpis(req, res) {
  try {
    const { user: sl, areaIds } = await getSLAreaIds(req.userId);
    if (!sl) return res.status(404).json({ message: "Utilizador nao encontrado" });

    const totalUsers = await User.count({ where: { area_id: areaIds } });
    const badgesObtidosTotal = await database.query(
      `SELECT COUNT(*)::int AS count
       FROM consultor_badges cb
       JOIN "Users" u ON u.id = cb.consultor_id
       WHERE cb.status = 'obtido' AND u.area_id IN (:areaIds)`,
      { replacements: { areaIds }, type: QueryTypes.SELECT },
    );

    const usersByRole = await User.findAll({
      attributes: ["role", [fn("COUNT", col("id")), "count"]],
      where: { area_id: areaIds },
      group: ["role"],
      raw: true,
    });

    const badgesByMonthRaw = await database.query(
      `SELECT to_char(date_trunc('month', cb.data_atribuicao), 'YYYY-MM') AS month, COUNT(*)::int AS count
       FROM consultor_badges cb
       JOIN "Users" u ON u.id = cb.consultor_id
       WHERE cb.status = 'obtido' AND cb.data_atribuicao IS NOT NULL AND u.area_id IN (:areaIds)
       GROUP BY 1
       ORDER BY 1`,
      { replacements: { areaIds }, type: QueryTypes.SELECT },
    );

    const end = req.query.endDate ? new Date(req.query.endDate) : new Date();
    const start = req.query.startDate ? new Date(req.query.startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

    const badgesByRangeRaw = await database.query(
      `SELECT COUNT(*)::int AS count
       FROM consultor_badges cb
       JOIN "Users" u ON u.id = cb.consultor_id
       WHERE cb.status = 'obtido' AND u.area_id IN (:areaIds)
         AND cb.data_atribuicao BETWEEN :start AND :end`,
      { replacements: { areaIds, start, end }, type: QueryTypes.SELECT },
    );

    const badgesByLevel = await database.query(
      `SELECT b.level, COUNT(cb.id)::int AS count
       FROM consultor_badges cb
       JOIN "Users" u ON u.id = cb.consultor_id
       JOIN badges b ON b.id = cb.badge_id
       WHERE cb.status = 'obtido' AND u.area_id IN (:areaIds)
       GROUP BY b.level
       ORDER BY b.level`,
      { replacements: { areaIds }, type: QueryTypes.SELECT },
    );

    res.json({
      summary: { totalUsers, badgesObtidosTotal: badgesObtidosTotal[0]?.count || 0 },
      usersByRole,
      badgesByMonth: buildMonthlySeries(badgesByMonthRaw, start, end),
      badgesByRange: { startDate: start.toISOString(), endDate: end.toISOString(), count: badgesByRangeRaw[0]?.count || 0 },
      badgesByLevel,
    });
  } catch (err) {
    console.error("Erro KPIs SL:", err);
    res.status(500).json({ message: "Erro no servidor" });
  }
}

export async function getSLConsultores(req, res) {
  try {
    const { areaIds } = await getSLAreaIds(req.userId);
    const consultores = await database.query(
      `SELECT u.id, u.name, u.email, COALESCE(u.points_total, 0) AS points_total, a.name AS area,
              COUNT(cb.id)::int AS total_pedidos,
              COUNT(cb.id) FILTER (WHERE cb.status = 'obtido')::int AS badges_obtidos,
              COUNT(cb.id) FILTER (WHERE cb.status = 'pendente')::int AS badges_pendentes,
              COUNT(cb.id) FILTER (WHERE cb.status = 'rejeitado')::int AS badges_rejeitados,
              CASE WHEN COUNT(cb.id) = 0 THEN 0
                   ELSE ROUND((COUNT(cb.id) FILTER (WHERE cb.status = 'obtido')::numeric / COUNT(cb.id)::numeric) * 100)::int
              END AS progresso
       FROM "Users" u
       LEFT JOIN areas a ON a.id = u.area_id
       LEFT JOIN consultor_badges cb ON cb.consultor_id = u.id
       WHERE u.role = 'consultant' AND u.area_id IN (:areaIds)
       GROUP BY u.id, u.name, u.email, u.points_total, a.name
       ORDER BY COALESCE(u.points_total, 0) DESC, badges_obtidos DESC, u.name`,
      { replacements: { areaIds }, type: QueryTypes.SELECT },
    );

    const timeline = await database.query(
      `SELECT cb.consultor_id, cb.id, cb.badge_id, COALESCE(b.description, 'Badge #' || b.id) AS badge,
              cb.status, cb.workflow_status, COALESCE(cb.data_atribuicao, cb.submitted_at, NOW()) AS data
       FROM consultor_badges cb
       JOIN badges b ON b.id = cb.badge_id
       JOIN "Users" u ON u.id = cb.consultor_id
       WHERE u.area_id IN (:areaIds)
       ORDER BY data DESC NULLS LAST`,
      { replacements: { areaIds }, type: QueryTypes.SELECT },
    );

    res.json(consultores.map((consultor, index) => ({
      ...consultor,
      ranking: index + 1,
      timeline: timeline.filter((item) => item.consultor_id === consultor.id).slice(0, 8),
    })));
  } catch (err) {
    console.error("Erro consultores SL:", err);
    res.status(500).json({
      message: "Erro ao listar consultores",
      detail: process.env.NODE_ENV === "production" ? undefined : err.message,
    });
  }
}

export async function getSLCatalogo(req, res) {
  try {
    const badges = await Badge.findAll({
      include: [
        { model: Area, as: "area", attributes: ["id", "name", "service_line_id"] },
        { model: Requirement, as: "requirements", attributes: ["id", "code", "title", "description"] },
      ],
      order: [["level", "ASC"], ["id", "ASC"]],
    });
    res.json(badges);
  } catch (err) {
    console.error("Erro catalogo SL:", err);
    res.status(500).json({ message: "Erro ao listar catalogo" });
  }
}

export async function getSLHistorico(req, res) {
  try {
    const { areaIds } = await getSLAreaIds(req.userId);
    const status = req.query.status && req.query.status !== "todos" ? req.query.status : null;
    const rows = await database.query(
      `SELECT re.id, u.name AS consultor, COALESCE(b.description, 'Badge #' || b.id) AS badge,
              COALESCE(r.title, r.code, 'Requisito') AS requisito, re.status AS estado,
              re.notes AS observacoes, re.updated_at AS data
       FROM requirement_evidences re
       JOIN "Users" u ON u.id = re.consultor_id
       JOIN badges b ON b.id = re.badge_id
       LEFT JOIN requirements r ON r.id = re.requirement_id
       WHERE u.area_id IN (:areaIds)
         AND (:status IS NULL OR re.status = :status)
       ORDER BY re.updated_at DESC NULLS LAST`,
      { replacements: { areaIds, status }, type: QueryTypes.SELECT },
    );
    res.json(rows);
  } catch (err) {
    console.error("Erro historico SL:", err);
    res.status(500).json({ message: "Erro ao listar historico" });
  }
}

export async function getSLRelatorio(req, res) {
  try {
    const { areaIds } = await getSLAreaIds(req.userId);
    const filters = buildFilters(req.query);
    const rows = await getReportRows({ areaIds, scope: req.query.scope, filters, limit: 250 });
    res.json({ rows, period: { startDate: filters.start, endDate: filters.end } });
  } catch (err) {
    console.error("Erro relatorio SL:", err);
    res.status(500).json({
      message: "Erro ao gerar relatorio",
      detail: process.env.NODE_ENV === "production" ? undefined : err.message,
    });
  }
}

export async function getSLGamificacao(req, res) {
  try {
    const { areaIds } = await getSLAreaIds(req.userId);
    if (!areaIds.length) return res.json({ premiumBadges: [], consultores: [], tiers: [], speedAchievers: [], conquistas: [] });

    const premiumBadges = await Badge.findAll({
      where: {
        area_id: { [Op.in]: areaIds },
        [Op.or]: [
          { level: { [Op.in]: ["Especialista", "Lider"] } },
          { points: { [Op.gte]: 100 } },
        ],
      },
      include: [{ model: Area, as: "area", attributes: ["id", "name"] }],
      order: [["points", "DESC"], ["level", "DESC"]],
    });

    const consultores = await database.query(
      `SELECT u.id, u.name, u.email, COALESCE(u.points_total, 0) AS points_total, a.name AS area,
              COUNT(cb.id) FILTER (WHERE cb.status = 'obtido')::int AS badges_obtidos,
              COUNT(cb.id) FILTER (
                WHERE cb.status = 'obtido' AND (b.level IN ('Especialista', 'Lider') OR COALESCE(b.points,0) >= 100)
              )::int AS premium_obtidos
       FROM "Users" u
       LEFT JOIN areas a ON a.id = u.area_id
       LEFT JOIN consultor_badges cb ON cb.consultor_id = u.id
       LEFT JOIN badges b ON b.id = cb.badge_id
       WHERE u.role = 'consultant' AND u.area_id IN (:areaIds)
       GROUP BY u.id, u.name, u.email, u.points_total, a.name
       ORDER BY COALESCE(u.points_total, 0) DESC, badges_obtidos DESC`,
      { replacements: { areaIds }, type: QueryTypes.SELECT }
    );

    const tierDefs = [
      { name: "Platina", threshold: 500, icon: "bi-gem", color: "#0ea5e9" },
      { name: "Ouro", threshold: 200, icon: "bi-trophy-fill", color: "#f59e0b" },
      { name: "Prata", threshold: 100, icon: "bi-award-fill", color: "#94a3b8" },
      { name: "Bronze", threshold: 50, icon: "bi-patch-check-fill", color: "#b45309" },
      { name: "Iniciante", threshold: 0, icon: "bi-star-fill", color: "#6b7280" },
    ];
    const tiers = tierDefs.map((tier, i) => ({
      ...tier,
      count: consultores.filter((c) => {
        const pts = Number(c.points_total);
        const next = tierDefs[i - 1];
        return next ? pts >= tier.threshold && pts < next.threshold : pts >= tier.threshold;
      }).length,
    }));

    const speedAchievers = await database.query(
      `SELECT u.id, u.name, COUNT(*)::int AS badges_no_mes, to_char(date_trunc('month', cb.data_atribuicao), 'YYYY-MM') AS mes
       FROM consultor_badges cb
       JOIN "Users" u ON u.id = cb.consultor_id
       WHERE cb.status = 'obtido' AND cb.data_atribuicao IS NOT NULL AND u.area_id IN (:areaIds)
       GROUP BY u.id, u.name, date_trunc('month', cb.data_atribuicao)
       HAVING COUNT(*) >= 3
       ORDER BY badges_no_mes DESC, mes DESC
       LIMIT 10`,
      { replacements: { areaIds }, type: QueryTypes.SELECT }
    );

    // Special achievement: consultants who completed all 5 levels in any area
    const fullAreaAchievers = await database.query(
      `SELECT u.id, u.name, a.name AS area, COUNT(DISTINCT b.level)::int AS niveis_completos
       FROM consultor_badges cb
       JOIN "Users" u ON u.id = cb.consultor_id
       JOIN badges b ON b.id = cb.badge_id
       JOIN areas a ON a.id = b.area_id
       WHERE cb.status = 'obtido' AND u.area_id IN (:areaIds) AND b.area_id IN (:areaIds)
       GROUP BY u.id, u.name, a.id, a.name
       HAVING COUNT(DISTINCT b.level) >= 5
       ORDER BY niveis_completos DESC`,
      { replacements: { areaIds }, type: QueryTypes.SELECT }
    );

    res.json({ premiumBadges, consultores: consultores.slice(0, 20), tiers, speedAchievers, fullAreaAchievers });
  } catch (err) {
    console.error("Erro gamificacao SL:", err);
    res.status(500).json({ message: "Erro ao carregar gamificacao" });
  }
}

export async function exportSLReportExcel(req, res) {
  try {
    const { areaIds } = await getSLAreaIds(req.userId);
    const filters = buildFilters(req.body);
    const scope = normalizeScope(req.body.scope);
    const rows = await getReportRows({ areaIds, scope, filters });
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Relatorio SL");
    sheet.columns = [
      { header: "Tipo", key: "tipo", width: 16 },
      { header: "Consultor", key: "consultor", width: 28 },
      { header: "Badge", key: "badge", width: 30 },
      { header: "Situacao", key: "situacao", width: 14 },
      { header: "Pontos", key: "pontos", width: 10 },
      { header: "Area", key: "area", width: 20 },
      { header: "Data", key: "data", width: 16 },
    ];
    rows.forEach((row) => sheet.addRow({ ...row, data: row.data ? new Date(row.data).toLocaleDateString("pt-PT") : "" }));
    sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF16558C" } };
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="sl-${scope}-${Date.now()}.xlsx"`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Erro export Excel SL:", err);
    res.status(500).json({ message: "Erro ao exportar Excel" });
  }
}

export async function exportSLReportPDF(req, res) {
  try {
    const { areaIds } = await getSLAreaIds(req.userId);
    const filters = buildFilters(req.body);
    const scope = normalizeScope(req.body.scope);
    const rows = await getReportRows({ areaIds, scope, filters, limit: 120 });
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="sl-${scope}-${Date.now()}.pdf"`);
    doc.pipe(res);
    doc.fontSize(18).font("Helvetica-Bold").fillColor("#111827").text("Relatorio Service Line", { align: "center" });
    doc.moveDown();
    rows.forEach((row) => {
      if (doc.y > 760) doc.addPage();
      doc.fontSize(9).fillColor("#111827").text(`${row.tipo} | ${row.consultor} | ${row.badge} | ${row.situacao} | ${row.data ? new Date(row.data).toLocaleDateString("pt-PT") : "-"}`);
    });
    doc.end();
  } catch (err) {
    console.error("Erro export PDF SL:", err);
    res.status(500).json({ message: "Erro ao exportar PDF" });
  }
}
