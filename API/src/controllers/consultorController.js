import Badge from "../models/Badge.js";
import ConsultorBadge from "../models/ConsultorBadge.js";

export async function getConsultantBadges(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "ID do consultor é obrigatório." });
    }

    // Obter badges atribuídos ao consultor através da tabela de junção
    const consultorBadges = await ConsultorBadge.findAll({
      where: { consultor_id: id },
      attributes: ["badge_id"],
    });

    const badgeIds = consultorBadges.map((cb) => cb.badge_id);

    if (!badgeIds.length) {
      return res.json([]);
    }

    const badges = await Badge.findAll({
      where: { id: badgeIds },
    });

    res.json(badges);

  } catch (err) {
    console.error("Erro ao buscar badges do consultor:", err);
    res.status(500).json({ message: "Erro servidor." });
  }
}
