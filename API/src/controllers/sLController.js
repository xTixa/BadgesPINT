import User from "../models/User.js";
import ConsultorBadge from "../models/ConsultorBadge.js";

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
