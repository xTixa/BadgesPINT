import { Badge } from "../models/index.js";

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
