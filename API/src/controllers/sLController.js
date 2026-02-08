import User from "../models/User.js";
import ConsultorBadge from "../models/ConsultorBadge.js";
import Area from "../models/Area.js";
import database from "../config/database.js";
import { QueryTypes, fn, col } from "sequelize";

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
    const sl = await User.findByPk(req.userId);

    const totalConsultores = await User.count({
      where: { area_id: sl.area_id, role: "consultant" }
    });

    const cursosAtivos = 4; // caso não tenhas tabela ainda
    const badgesPendentes = await ConsultorBadge.count({
      where: { status: "pendente" }
    });

    const totalBadges = await ConsultorBadge.count();
    const concluidos = await ConsultorBadge.count({
      where: { status: "obtido" }
    });
    
    const progressoMedio = totalBadges
      ? Math.round((concluidos / totalBadges) * 100)
      : 0;

    res.json({
      totalConsultores,
      cursosAtivos,
      badgesPendentes,
      progressoMedio
    });

  } catch (err) {
    console.error("Erro estatísticas SL:", err);
    res.status(500).json({ message: "Erro no servidor" });
  }
}

export async function getSLKpis(req, res) {
  try {
    const sl = await User.findByPk(req.userId);
    if (!sl) return res.status(404).json({ message: "Utilizador não encontrado" });

    const { serviceLineId } = req.query;

    let areaIds = [sl.area_id];
    if (serviceLineId) {
      const areas = await Area.findAll({ where: { service_line_id: serviceLineId }, attributes: ["id"], raw: true });
      areaIds = areas.map((a) => a.id);
    }

    const totalUsers = await User.count({ where: { area_id: areaIds } });
    const badgesObtidosTotal = await database.query(
      `SELECT COUNT(*)::int AS count
       FROM consultor_badges cb
       JOIN "Users" u ON u.id = cb.consultor_id
       WHERE cb.status = 'obtido' AND u.area_id = ANY(:areaIds)`,
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
       WHERE cb.status = 'obtido' AND cb.data_atribuicao IS NOT NULL AND u.area_id = ANY(:areaIds)
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
       WHERE cb.status = 'obtido' AND u.area_id = ANY(:areaIds)
         AND cb.data_atribuicao BETWEEN :start AND :end`,
      { replacements: { areaIds, start, end }, type: QueryTypes.SELECT }
    );

    const badgesByLevel = await database.query(
      `SELECT b.level, COUNT(cb.id)::int AS count
       FROM consultor_badges cb
       JOIN "Users" u ON u.id = cb.consultor_id
       JOIN badges b ON b.id = cb.badge_id
       WHERE cb.status = 'obtido' AND u.area_id = ANY(:areaIds)
       GROUP BY b.level
       ORDER BY b.level`,
      { replacements: { areaIds }, type: QueryTypes.SELECT }
    );

    const monthly = buildMonthlySeries(badgesByMonthRaw, start, end);

    res.json({
      summary: {
        totalUsers,
        badgesObtidosTotal: badgesObtidosTotal[0]?.count || 0,
      },
      usersByRole,
      badgesByMonth: monthly,
      badgesByRange: {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        count: badgesByRangeRaw[0]?.count || 0,
      },
      badgesByLevel,
    });

  } catch (err) {
    console.error("Erro KPIs SL:", err);
    res.status(500).json({ message: "Erro no servidor" });
  }
}
