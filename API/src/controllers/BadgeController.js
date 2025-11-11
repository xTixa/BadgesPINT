import { Badge, Area } from "../models/index.js";

// Retorna todos os badges
export async function getAllBadges(req, res) {
  try {
    const badges = await Badge.findAll({
      include: {
        model: Area,
        as: "area",
        attributes: ["id", "name"]
      },
      order: [["points", "DESC"]]
    });
    res.json(badges);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao obter badges" });
  }
}

export async function getBadgesByArea(req, res) {
  try {
    const { id } = req.params; // area id
    const badges = await Badge.findAll({
      where: { area_id: id },
      order: [["level","ASC"]]
    });
    res.json(badges);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao obter badges" });
  }
}
