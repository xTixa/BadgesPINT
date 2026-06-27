import { QueryTypes } from "sequelize";
import database from "../config/database.js";

async function getAreaIds(req) {
  if (req.userRole === "talent_manager") {
    const rows = await database.query(
      `SELECT area_id FROM "Users" WHERE id = :userId`,
      { replacements: { userId: req.userId }, type: QueryTypes.SELECT },
    );
    return rows[0]?.area_id ? [Number(rows[0].area_id)] : [];
  }
  const rows = await database.query(
    `SELECT target.id
     FROM "Users" manager
     JOIN areas own_area ON own_area.id = manager.area_id
     JOIN areas target ON target.service_line_id = own_area.service_line_id
     WHERE manager.id = :userId`,
    { replacements: { userId: req.userId }, type: QueryTypes.SELECT },
  );
  return rows.map((row) => Number(row.id));
}

function monthKeys(count = 6) {
  const keys = [];
  const date = new Date();
  date.setUTCDate(1);
  for (let offset = count - 1; offset >= 0; offset -= 1) {
    const current = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - offset, 1));
    keys.push(`${current.getUTCFullYear()}-${String(current.getUTCMonth() + 1).padStart(2, "0")}`);
  }
  return keys;
}

export async function getConsultantComparison(req, res) {
  try {
    const areaIds = await getAreaIds(req);
    if (!areaIds.length) return res.json({ available: [], consultants: [], benchmark: null, months: monthKeys() });

    const available = await database.query(
      `SELECT u.id, u.name, u.email, a.name AS area
       FROM "Users" u JOIN areas a ON a.id = u.area_id
       WHERE u.role = 'consultant' AND u.area_id IN (:areaIds)
       ORDER BY u.name`,
      { replacements: { areaIds }, type: QueryTypes.SELECT },
    );
    const allowed = new Set(available.map((item) => Number(item.id)));
    const requested = String(req.query.ids || "").split(",").map(Number).filter((id) => allowed.has(id));
    const selectedIds = [...new Set(requested)].slice(0, 4);
    if (!selectedIds.length) selectedIds.push(...available.slice(0, 2).map((item) => Number(item.id)));
    if (!selectedIds.length) return res.json({ available, consultants: [], benchmark: null, months: monthKeys() });

    const metrics = await database.query(
      `SELECT u.id, u.name, u.email, a.name AS area, COALESCE(u.points_total, 0)::int AS points,
              COUNT(cb.id)::int AS applications,
              COUNT(cb.id) FILTER (WHERE cb.status = 'obtido')::int AS obtained,
              COUNT(cb.id) FILTER (WHERE cb.status = 'pendente')::int AS pending,
              COUNT(cb.id) FILTER (WHERE cb.status = 'rejeitado')::int AS rejected,
              COUNT(cb.id) FILTER (WHERE cb.status = 'obtido' AND cb.data_atribuicao >= CURRENT_DATE - INTERVAL '90 days')::int AS obtained_90_days,
              CASE WHEN COUNT(cb.id) = 0 THEN 0 ELSE ROUND(100.0 * COUNT(cb.id) FILTER (WHERE cb.status = 'obtido') / COUNT(cb.id))::int END AS approval_rate,
              COALESCE(ROUND(AVG(EXTRACT(EPOCH FROM (cb.data_atribuicao - cb.submitted_at)) / 86400.0)
                FILTER (WHERE cb.status = 'obtido' AND cb.data_atribuicao IS NOT NULL AND cb.submitted_at IS NOT NULL), 1), 0) AS avg_validation_days
       FROM "Users" u
       JOIN areas a ON a.id = u.area_id
       LEFT JOIN consultor_badges cb ON cb.consultor_id = u.id
       WHERE u.id IN (:selectedIds)
       GROUP BY u.id, u.name, u.email, a.name, u.points_total
       ORDER BY points DESC, obtained DESC`,
      { replacements: { selectedIds }, type: QueryTypes.SELECT },
    );
    const details = await database.query(
      `SELECT cb.consultor_id, b.level, cb.data_atribuicao
       FROM consultor_badges cb JOIN badges b ON b.id = cb.badge_id
       WHERE cb.consultor_id IN (:selectedIds) AND cb.status = 'obtido'`,
      { replacements: { selectedIds }, type: QueryTypes.SELECT },
    );
    const months = monthKeys();
    const consultants = metrics.map((item) => {
      const own = details.filter((row) => Number(row.consultor_id) === Number(item.id));
      const levels = own.reduce((result, row) => ({ ...result, [row.level]: (result[row.level] || 0) + 1 }), {});
      const trend = months.map((month) => own.filter((row) => row.data_atribuicao && new Date(row.data_atribuicao).toISOString().slice(0, 7) === month).length);
      return { ...item, points: Number(item.points), applications: Number(item.applications), obtained: Number(item.obtained), pending: Number(item.pending), rejected: Number(item.rejected), obtained_90_days: Number(item.obtained_90_days), approval_rate: Number(item.approval_rate), avg_validation_days: Number(item.avg_validation_days), levels, trend };
    });
    const average = (key) => consultants.length ? Math.round((consultants.reduce((sum, item) => sum + Number(item[key] || 0), 0) / consultants.length) * 10) / 10 : 0;
    res.json({
      available,
      consultants,
      months,
      benchmark: { points: average("points"), obtained: average("obtained"), approval_rate: average("approval_rate"), avg_validation_days: average("avg_validation_days") },
    });
  } catch (error) {
    console.error("Erro ao comparar consultores:", error);
    res.status(500).json({ message: "Erro ao comparar consultores" });
  }
}
