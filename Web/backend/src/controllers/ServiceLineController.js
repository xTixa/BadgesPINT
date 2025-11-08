import { ServiceLine } from "../models/index.js";

export async function getServiceLinesByLP(req, res) {
  try {
    const { id } = req.params; // learning path id
    const sl = await ServiceLine.findAll({
      where: { learning_path_id: id },
      order: [["name","ASC"]]
    });
    res.json(sl);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao obter service lines" });
  }
}
