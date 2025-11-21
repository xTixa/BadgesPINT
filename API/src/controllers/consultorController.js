import Badge from "../models/Badge.js";

export async function getConsultantBadges(req, res) {
  try {
    const { id } = req.params;

    const badges = await Badge.findAll({
      where: { consultant_id: id }
    });

    res.json(badges);

  } catch (err) {
    console.error("Erro ao buscar badges do consultor:", err);
    res.status(500).json({ message: "Erro servidor." });
  }
}
