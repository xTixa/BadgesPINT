import User from "../models/User.js";
import Badge from "../models/Badge.js";
import ConsultorBadge from "../models/ConsultorBadge.js";
import Area from "../models/Area.js";
import Requirement from "../models/Requirement.js";
import RequirementEvidence from "../models/RequirementEvidence.js";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import database from "../config/database.js";
import { QueryTypes, Op, fn, col } from "sequelize";

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

export const getTMAreaIds = async (tm, serviceLineId = null) => {
  if (serviceLineId) {
    const areas = await Area.findAll({ where: { service_line_id: serviceLineId }, attributes: ["id"], raw: true });
    return areas.map((area) => area.id);
  }
  if (tm?.area_id) return [tm.area_id];
  // TM sem área definida — acede a todas as áreas
  const all = await Area.findAll({ attributes: ["id"], raw: true });
  return all.map((a) => a.id);
};

const normalizeScope = (scope) => {
  if (scope === "consultores") return "users";
  if (scope === "aprovacoes") return "aprovacoes";
  if (scope === "rejeicoes") return "rejeicoes";
  return scope || "pedidos";
};

const buildTMFilters = (query = {}) => {
  const end = query.endDate || query.ate
    ? new Date(query.endDate || query.ate)
    : new Date();
  const start = query.startDate || query.de
    ? new Date(query.startDate || query.de)
    : new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000);

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
};

const getTMReportRows = async ({ areaIds, scope, filters, limit = null }) => {
  const normalized = normalizeScope(scope);
  const replacements = {
    areaIds,
    start: filters.start,
    end: filters.end,
    consultor: filters.consultor,
    badge: filters.badge,
    limit,
  };

  const whereText = `
    u.area_id IN (:areaIds)
    AND COALESCE(cb.created_at, cb.submitted_at, cb.data_atribuicao, NOW()) BETWEEN :start AND :end
    AND (:consultor IS NULL OR u.name ILIKE :consultor)
    AND (:badge IS NULL OR b.description ILIKE :badge)
  `;

  if (normalized === "badges") {
    return database.query(
      `SELECT b.id, 'badges' AS tipo, '-' AS consultor, COALESCE(b.description, 'Badge #' || b.id) AS badge,
              b.level AS detalhe, b.points::text AS pontos, a.name AS area, 'catalogo' AS situacao, NULL::timestamp AS data
       FROM badges b
       JOIN areas a ON a.id = b.area_id
       WHERE b.area_id IN (:areaIds)
         AND (:badge IS NULL OR b.description ILIKE :badge)
       ORDER BY b.id DESC
       ${limit ? "LIMIT :limit" : ""}`,
      { replacements, type: QueryTypes.SELECT }
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
       ORDER BY u.name ASC
       ${limit ? "LIMIT :limit" : ""}`,
      { replacements, type: QueryTypes.SELECT }
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
            cb.status AS situacao, COALESCE(cb.data_atribuicao, cb.submitted_at, cb.created_at) AS data,
            cb.tm_comment, cb.sl_comment, cb.rejection_reason
     FROM consultor_badges cb
     JOIN "Users" u ON u.id = cb.consultor_id
     JOIN badges b ON b.id = cb.badge_id
     LEFT JOIN areas a ON a.id = b.area_id
     WHERE ${whereText}
       ${statusFilter}
     ORDER BY data DESC NULLS LAST
     ${limit ? "LIMIT :limit" : ""}`,
    { replacements: { ...replacements, scope: normalized }, type: QueryTypes.SELECT }
  );
};

export async function getTM(req, res) {
  try {
    const tm = await User.findByPk(req.userId);

    res.json(tm);

  } catch (err) {
    console.error("Erro getTM:", err);
    res.status(500).json({ message: "Erro no servidor" });
  }
}

export async function getTmPreferences(req, res) {
  try {
    const tm = await User.findByPk(req.userId, { attributes: ["id", "tm_preferences"] });
    if (!tm) return res.status(404).json({ message: "TM nao encontrado" });

    res.json(tm.tm_preferences || {});
  } catch (err) {
    console.error("Erro ao obter preferencias do TM:", err);
    res.status(500).json({ message: "Erro ao obter preferencias" });
  }
}

export async function updateTmPreferences(req, res) {
  try {
    const tm = await User.findByPk(req.userId);
    if (!tm) return res.status(404).json({ message: "TM nao encontrado" });

    tm.tm_preferences = req.body || {};
    await tm.save();

    res.json(tm.tm_preferences);
  } catch (err) {
    console.error("Erro ao guardar preferencias do TM:", err);
    res.status(500).json({ message: "Erro ao guardar preferencias" });
  }
}

export async function getTMEstatisticas(req, res) {
  try {
    const tm = await User.findByPk(req.userId);
    if (!tm) return res.status(404).json({ message: "TM nao encontrado" });
    const areaIds = await getTMAreaIds(tm);
    if (!areaIds.length) return res.json({ totalEquipa: 0, evidenciasPendentes: 0, progressoMedio: 0 });

    const totalEquipa = await User.count({
      where: { area_id: areaIds, role: "consultant" }
    });

    const evidenciasPendentes = await database.query(
      `SELECT COUNT(re.id)::int AS count
       FROM requirement_evidences re
       JOIN "Users" u ON u.id = re.consultor_id
       WHERE re.status = 'pendente' AND u.area_id IN (:areaIds)`,
      { replacements: { areaIds }, type: QueryTypes.SELECT }
    );

    const totalBadgesRaw = await database.query(
      `SELECT COUNT(cb.id)::int AS count
       FROM consultor_badges cb
       JOIN "Users" u ON u.id = cb.consultor_id
       WHERE u.area_id IN (:areaIds)`,
      { replacements: { areaIds }, type: QueryTypes.SELECT }
    );
    const concluidosRaw = await database.query(
      `SELECT COUNT(cb.id)::int AS count
       FROM consultor_badges cb
       JOIN "Users" u ON u.id = cb.consultor_id
       WHERE cb.status = 'obtido' AND u.area_id IN (:areaIds)`,
      { replacements: { areaIds }, type: QueryTypes.SELECT }
    );
    const totalBadges = totalBadgesRaw[0]?.count || 0;
    const concluidos = concluidosRaw[0]?.count || 0;

    const progressoMedio = totalBadges
      ? Math.round((concluidos / totalBadges) * 100)
      : 0;

    res.json({
      totalEquipa,
      evidenciasPendentes: evidenciasPendentes[0]?.count || 0,
      progressoMedio
    });

  } catch (err) {
    console.error("Erro estatísticas TM:", err);
    res.status(500).json({ message: "Erro no servidor" });
  }
}

export async function getTMKpis(req, res) {
  try {
    const tm = await User.findByPk(req.userId);
    if (!tm) return res.status(404).json({ message: "TM não encontrado" });

    const { serviceLineId } = req.query;
    const areaIds = await getTMAreaIds(tm, serviceLineId);
    if (!areaIds.length) return res.json({
      summary: { totalUsers: 0, totalBadges: 0, badgesObtidosTotal: 0 },
      usersByRole: [],
      badgesByMonth: [],
      badgesByRange: { startDate: new Date().toISOString(), endDate: new Date().toISOString(), count: 0 },
      badgesByLearningPath: [],
      badgesByLevel: [],
    });

    const totalUsers = await User.count({ where: { area_id: areaIds } });
    const totalBadges = await Badge.count();
    const badgesObtidosTotal = await database.query(
      `SELECT COUNT(*)::int AS count
       FROM consultor_badges cb
       JOIN "Users" u ON u.id = cb.consultor_id
       WHERE cb.status = 'obtido' AND u.area_id IN (:areaIds)`,
      { replacements: { areaIds }, type: QueryTypes.SELECT }
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
      { replacements: { areaIds }, type: QueryTypes.SELECT }
    );

    const { startDate, endDate } = req.query;
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

    const badgesByRangeRaw = await database.query(
      `SELECT COUNT(*)::int AS count
       FROM consultor_badges cb
       JOIN "Users" u ON u.id = cb.consultor_id
       WHERE cb.status = 'obtido' AND u.area_id IN (:areaIds)
         AND cb.data_atribuicao BETWEEN :start AND :end`,
      { replacements: { areaIds, start, end }, type: QueryTypes.SELECT }
    );

    const badgesByLearningPath = await database.query(
      `SELECT lp.id, lp.name, COUNT(cb.id)::int AS count
       FROM consultor_badges cb
       JOIN "Users" u ON u.id = cb.consultor_id
       JOIN badges b ON b.id = cb.badge_id
       JOIN areas a ON a.id = b.area_id
       JOIN service_lines sl ON sl.id = a.service_line_id
       JOIN learning_paths lp ON lp.id = sl.learning_path_id
       WHERE cb.status = 'obtido' AND u.area_id IN (:areaIds)
       GROUP BY lp.id, lp.name
       ORDER BY lp.name`,
      { replacements: { areaIds }, type: QueryTypes.SELECT }
    );

    const badgesByLevel = await database.query(
      `SELECT b.level, COUNT(cb.id)::int AS count
       FROM consultor_badges cb
       JOIN "Users" u ON u.id = cb.consultor_id
       JOIN badges b ON b.id = cb.badge_id
       WHERE cb.status = 'obtido' AND u.area_id IN (:areaIds)
       GROUP BY b.level
       ORDER BY b.level`,
      { replacements: { areaIds }, type: QueryTypes.SELECT }
    );

    const monthly = buildMonthlySeries(badgesByMonthRaw, start, end).map((row) => ({
      ...row,
      completionRate: totalBadges > 0 ? Math.round((row.count / totalBadges) * 100) : 0,
    }));

    res.json({
      summary: {
        totalUsers,
        totalBadges,
        badgesObtidosTotal: badgesObtidosTotal[0]?.count || 0,
      },
      usersByRole,
      badgesByMonth: monthly,
      badgesByRange: {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        count: badgesByRangeRaw[0]?.count || 0,
      },
      badgesByLearningPath,
      badgesByLevel,
    });

  } catch (err) {
    console.error("Erro KPIs TM:", err);
    res.status(500).json({ message: "Erro no servidor" });
  }
}

export async function getEquipa(req, res) {
  try {
    const tm = await User.findByPk(req.userId);
    if (!tm) return res.status(404).json({ message: "TM nao encontrado" });
    const areaIds = await getTMAreaIds(tm, req.query.serviceLineId);
    if (!areaIds.length) return res.json([]);

    const equipa = await database.query(
      `SELECT u.id, u.name, u.email, COALESCE(u.points_total, 0) AS points_total, a.name AS area,
              sl.name AS service_line,
              COUNT(cb.id)::int AS total_pedidos,
              COUNT(cb.id) FILTER (WHERE cb.status = 'obtido')::int AS badges_obtidos,
              COUNT(cb.id) FILTER (WHERE cb.status = 'pendente')::int AS badges_pendentes,
              COUNT(cb.id) FILTER (WHERE cb.status = 'rejeitado')::int AS badges_rejeitados,
              CASE WHEN COUNT(cb.id) = 0 THEN 0
                   ELSE ROUND((COUNT(cb.id) FILTER (WHERE cb.status = 'obtido')::numeric / COUNT(cb.id)::numeric) * 100)::int
              END AS progresso
       FROM "Users" u
       LEFT JOIN areas a ON a.id = u.area_id
       LEFT JOIN service_lines sl ON sl.id = a.service_line_id
       LEFT JOIN consultor_badges cb ON cb.consultor_id = u.id
       WHERE u.role = 'consultant' AND u.area_id IN (:areaIds)
       GROUP BY u.id, u.name, u.email, u.points_total, a.name, sl.name
       ORDER BY u.name`,
      { replacements: { areaIds }, type: QueryTypes.SELECT }
    );

    const expiracoes = await database.query(
      `SELECT cb.consultor_id, COALESCE(b.description, 'Badge #' || b.id) AS badge,
              (cb.data_atribuicao + (b.expiry_days::text || ' days')::interval)::date AS expires_at,
              ((cb.data_atribuicao + (b.expiry_days::text || ' days')::interval)::date - CURRENT_DATE)::int AS dias
       FROM consultor_badges cb
       JOIN badges b ON b.id = cb.badge_id
       JOIN "Users" u ON u.id = cb.consultor_id
       WHERE cb.status = 'obtido'
         AND cb.data_atribuicao IS NOT NULL
         AND b.expiry_days IS NOT NULL
         AND u.area_id IN (:areaIds)
         AND (cb.data_atribuicao + (b.expiry_days::text || ' days')::interval)::date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '60 days'
       ORDER BY dias ASC`,
      { replacements: { areaIds }, type: QueryTypes.SELECT }
    );

    const timeline = await database.query(
      `SELECT cb.consultor_id, cb.id, cb.badge_id, COALESCE(b.description, 'Badge #' || b.id) AS badge,
              cb.status, cb.workflow_status, COALESCE(cb.data_atribuicao, cb.submitted_at, cb.created_at) AS data
       FROM consultor_badges cb
       JOIN badges b ON b.id = cb.badge_id
       JOIN "Users" u ON u.id = cb.consultor_id
       WHERE u.area_id IN (:areaIds)
       ORDER BY data DESC NULLS LAST`,
      { replacements: { areaIds }, type: QueryTypes.SELECT }
    );

    const enriched = equipa.map((consultor) => ({
      ...consultor,
      badgesExpirando: expiracoes.filter((item) => item.consultor_id === consultor.id),
      timeline: timeline.filter((item) => item.consultor_id === consultor.id).slice(0, 8),
    }));

    res.json(enriched);

  } catch (err) {
    console.error("Erro equipa TM:", err);
    res.status(500).json({ message: "Erro no servidor" });
  }
}

export async function getTMCatalogo(req, res) {
  try {
    const tm = await User.findByPk(req.userId);
    if (!tm) return res.status(404).json({ message: "TM nao encontrado" });
    const areaIds = await getTMAreaIds(tm, req.query.serviceLineId);
    if (!areaIds.length) return res.json([]);

    const badges = await Badge.findAll({
      where: { area_id: { [Op.in]: areaIds } },
      include: [
        { model: Area, as: "area", attributes: ["id", "name", "service_line_id"] },
        { model: Requirement, as: "requirements", attributes: ["id", "code", "title", "description"] },
      ],
      order: [["level", "ASC"], ["id", "ASC"]],
    });

    res.json(badges);
  } catch (err) {
    console.error("Erro catalogo TM:", err);
    res.status(500).json({ message: "Erro ao listar catalogo" });
  }
}

export async function getTMHistorico(req, res) {
  try {
    const tm = await User.findByPk(req.userId);
    if (!tm) return res.status(404).json({ message: "TM nao encontrado" });
    const areaIds = await getTMAreaIds(tm, req.query.serviceLineId);
    if (!areaIds.length) return res.json([]);
    const status = req.query.status && req.query.status !== "todos" ? req.query.status : null;

    const rows = await database.query(
      `SELECT re.id, u.name AS consultor, COALESCE(b.description, 'Badge #' || b.id) AS badge,
              COALESCE(r.title, r.code, 'Requisito') AS requisito, re.status AS estado,
              re.notes AS observacoes, re.updated_at AS data,
              COALESCE(tm.name, 'Talent Manager') AS validador
       FROM requirement_evidences re
       JOIN "Users" u ON u.id = re.consultor_id
       JOIN badges b ON b.id = re.badge_id
       LEFT JOIN requirements r ON r.id = re.requirement_id
       LEFT JOIN "Users" tm ON tm.id = :tmId
       WHERE u.area_id IN (:areaIds)
         AND (:status IS NULL OR re.status = :status)
       ORDER BY re.updated_at DESC NULLS LAST`,
      { replacements: { areaIds, status, tmId: req.userId }, type: QueryTypes.SELECT }
    );

    res.json(rows);
  } catch (err) {
    console.error("Erro historico TM:", err);
    res.status(500).json({ message: "Erro ao listar historico" });
  }
}

export async function getTMRelatorio(req, res) {
  try {
    const tm = await User.findByPk(req.userId);
    if (!tm) return res.status(404).json({ message: "TM nao encontrado" });
    const areaIds = await getTMAreaIds(tm, req.query.serviceLineId);
    if (!areaIds.length) return res.json({ rows: [], totals: { total: 0 }, period: { startDate: new Date(), endDate: new Date() } });
    const filters = buildTMFilters(req.query);
    const rows = await getTMReportRows({ areaIds, scope: req.query.scope, filters, limit: 250 });

    const totals = rows.reduce((acc, row) => {
      const key = row.situacao || "total";
      acc[key] = (acc[key] || 0) + 1;
      acc.total += 1;
      return acc;
    }, { total: 0 });

    res.json({ rows, totals, period: { startDate: filters.start, endDate: filters.end } });
  } catch (err) {
    console.error("Erro relatorio TM:", err);
    res.status(500).json({ message: "Erro ao gerar relatorio" });
  }
}

export async function exportTMReportExcel(req, res) {
  try {
    const tm = await User.findByPk(req.userId);
    if (!tm) return res.status(404).json({ message: "TM nao encontrado" });
    const areaIds = await getTMAreaIds(tm, req.body.serviceLineId);
    if (!areaIds.length) return res.status(400).json({ message: "Sem área definida para exportar." });
    const filters = buildTMFilters(req.body);
    const scope = normalizeScope(req.body.scope);
    const rows = await getTMReportRows({ areaIds, scope, filters });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Relatorio TM");
    sheet.columns = [
      { header: "Tipo", key: "tipo", width: 16 },
      { header: "Consultor", key: "consultor", width: 28 },
      { header: "Badge", key: "badge", width: 30 },
      { header: "Situacao", key: "situacao", width: 14 },
      { header: "Detalhe", key: "detalhe", width: 22 },
      { header: "Pontos", key: "pontos", width: 10 },
      { header: "Area", key: "area", width: 20 },
      { header: "Data", key: "data", width: 16 },
    ];

    rows.forEach((row) => sheet.addRow({
      ...row,
      data: row.data ? new Date(row.data).toLocaleDateString("pt-PT") : "",
    }));
    sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF16558C" } };

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="tm-${scope}-${Date.now()}.xlsx"`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Erro export Excel TM:", err);
    res.status(500).json({ message: "Erro ao exportar Excel" });
  }
}

export async function exportTMReportPDF(req, res) {
  try {
    const tm = await User.findByPk(req.userId);
    if (!tm) return res.status(404).json({ message: "TM nao encontrado" });
    const areaIds = await getTMAreaIds(tm, req.body.serviceLineId);
    if (!areaIds.length) return res.status(400).json({ message: "Sem área definida para exportar." });
    const filters = buildTMFilters(req.body);
    const scope = normalizeScope(req.body.scope);
    const rows = await getTMReportRows({ areaIds, scope, filters, limit: 120 });

    const doc = new PDFDocument({ margin: 40, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="tm-${scope}-${Date.now()}.pdf"`);
    doc.pipe(res);

    doc.fontSize(18).font("Helvetica-Bold").fillColor("#111827").text("Relatorio Talent Manager", { align: "center" });
    doc.fontSize(9).font("Helvetica").fillColor("#475569").text(`Periodo: ${filters.start.toLocaleDateString("pt-PT")} a ${filters.end.toLocaleDateString("pt-PT")}`, { align: "center" });
    doc.moveDown();

    const header = ["Tipo", "Consultor", "Badge", "Situacao", "Data"];
    const widths = [70, 120, 140, 80, 70];
    drawSimpleTable(doc, [header, ...rows.map((row) => [
      row.tipo,
      row.consultor,
      row.badge,
      row.situacao,
      row.data ? new Date(row.data).toLocaleDateString("pt-PT") : "",
    ])], widths);

    doc.end();
  } catch (err) {
    console.error("Erro export PDF TM:", err);
    res.status(500).json({ message: "Erro ao exportar PDF" });
  }
}

function drawSimpleTable(doc, rows, widths) {
  let y = doc.y;
  const rowHeight = 22;
  rows.forEach((row, index) => {
    if (y + rowHeight > doc.page.height - 40) {
      doc.addPage();
      y = 40;
    }
    let x = 40;
    if (index === 0) {
      doc.fillColor("#16558C").rect(x, y, widths.reduce((a, b) => a + b, 0), rowHeight).fill();
    }
    row.forEach((cell, cellIndex) => {
      doc.fillColor(index === 0 ? "#FFFFFF" : "#111827")
        .font(index === 0 ? "Helvetica-Bold" : "Helvetica")
        .fontSize(8)
        .text(String(cell || "").slice(0, 36), x + 4, y + 7, { width: widths[cellIndex] - 8 });
      doc.strokeColor("#CBD5E1").rect(x, y, widths[cellIndex], rowHeight).stroke();
      x += widths[cellIndex];
    });
    y += rowHeight;
  });
}
