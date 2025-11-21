import User from "../models/User.js";
import Badge from "../models/Badge.js";
import ConsultorBadge from "../models/ConsultorBadge.js";

export async function getTM(req, res) {
  try {
    const tm = await User.findByPk(req.userId);

    res.json(tm);

  } catch (err) {
    console.error("Erro getTM:", err);
    res.status(500).json({ message: "Erro no servidor" });
  }
}

export async function getTMEstatisticas(req, res) {
  try {
    const tm = await User.findByPk(req.userId);

    const totalEquipa = await User.count({
      where: { area_id: tm.area_id, role: "consultant" }
    });

    const evidenciasPendentes = await ConsultorBadge.count({
      where: { status: "pendente" }
    });

    const totalBadges = await ConsultorBadge.count();
    const concluidos = await ConsultorBadge.count({ where: { status: "obtido" } });

    const progressoMedio = totalBadges
      ? Math.round((concluidos / totalBadges) * 100)
      : 0;

    res.json({
      totalEquipa,
      evidenciasPendentes,
      progressoMedio
    });

  } catch (err) {
    console.error("Erro estatísticas TM:", err);
    res.status(500).json({ message: "Erro no servidor" });
  }
}

export async function getEquipa(req, res) {
  try {
    const tm = await User.findByPk(req.userId);

    const equipa = await User.findAll({
      where: {
        area_id: tm.area_id,
        role: "consultant"
      },
      attributes: ["id", "name", "email", "points_total"]
    });

    res.json(equipa);

  } catch (err) {
    console.error("Erro equipa TM:", err);
    res.status(500).json({ message: "Erro no servidor" });
  }
}
