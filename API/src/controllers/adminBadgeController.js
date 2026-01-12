import Badge from "../models/Badge.js";
import Requirement from "../models/Requirement.js";
import Area from "../models/Area.js";

// 📌 LISTAR TODOS OS BADGES (com Área + Requisitos)
export async function adminGetAllBadges(req, res) {
  try {
    const badges = await Badge.findAll({
      include: [
        { model: Area, as: "area", attributes: ["id", "name"] },
        { model: Requirement, as: "requirements" }
      ],
      order: [["id", "ASC"]]
    });

    res.json(badges);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao listar badges" });
  }
}

// 📌 OBTER UM BADGE
export async function adminGetBadge(req, res) {
  try {
    const badge = await Badge.findByPk(req.params.id, {
      include: [
        { model: Area, as: "area", attributes: ["id", "name"] },
        { model: Requirement, as: "requirements" }
      ]
    });

    if (!badge) return res.status(404).json({ message: "Badge não encontrado" });

    res.json(badge);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao obter badge" });
  }
}

// 📌 CRIAR BADGE
export async function adminCreateBadge(req, res) {
  try {
    const newBadge = await Badge.create(req.body);
    res.status(201).json(newBadge);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar badge" });
  }
}

// 📌 ATUALIZAR BADGE
export async function adminUpdateBadge(req, res) {
  try {
    const badge = await Badge.findByPk(req.params.id);
    if (!badge) {
      return res.status(404).json({ message: "Badge não encontrado" });
    }

    await badge.update(req.body);
    
    const updated = await Badge.findByPk(req.params.id, {
      include: [
        { model: Area, as: "area", attributes: ["id", "name"] },
        { model: Requirement, as: "requirements" }
      ]
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar badge" });
  }
}

// 📌 APAGAR BADGE + REQUISITOS
export async function adminDeleteBadge(req, res) {
  try {
    const id = req.params.id;

    await Requirement.destroy({ where: { badge_id: id } });
    await Badge.destroy({ where: { id } });

    res.json({ message: "Badge eliminado com sucesso" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao eliminar badge" });
  }
}
