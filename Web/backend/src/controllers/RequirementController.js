import { Requirement } from "../models/index.js";

export async function getRequirementsByBadge(req, res) {
  try {
    const { id } = req.params; // badge id
    const reqs = await Requirement.findAll({
      where: { badge_id: id },
      order: [["code","ASC"]]
    });
    res.json(reqs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao obter requisitos" });
  }
}
