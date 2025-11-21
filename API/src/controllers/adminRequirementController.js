import Requirement from "../models/Requirement.js";

// 📌 LISTAR REQUISITOS POR BADGE
export async function adminGetRequirements(req, res) {
  try {
    const reqs = await Requirement.findAll({
      where: { badge_id: req.params.badge_id },
      order: [["code", "ASC"]]
    });

    res.json(reqs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao listar requisitos" });
  }
}

// 📌 CRIAR REQUISITO
export async function adminCreateRequirement(req, res) {
  try {
    const newReq = await Requirement.create(req.body);
    res.status(201).json(newReq);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar requisito" });
  }
}

// 📌 ATUALIZAR REQUISITO
export async function adminUpdateRequirement(req, res) {
  try {
    await Requirement.update(req.body, {
      where: { id: req.params.id }
    });
    res.json({ message: "Requisito atualizado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar requisito" });
  }
}

// 📌 APAGAR REQUISITO
export async function adminDeleteRequirement(req, res) {
  try {
    await Requirement.destroy({ where: { id: req.params.id } });
    res.json({ message: "Requisito removido" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao remover requisito" });
  }
}
