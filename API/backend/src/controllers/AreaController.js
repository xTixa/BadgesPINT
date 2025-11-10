import { Area } from "../models/index.js";

export async function getAreasByServiceLine(req, res) {
  try {
    const { id } = req.params; // service_line id
    const areas = await Area.findAll({
      where: { service_line_id: id },
      order: [["name","ASC"]]
    });
    res.json(areas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao obter areas" });
  }
}
