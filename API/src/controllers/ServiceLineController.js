import { ServiceLine, LearningPath, Area } from "../models/index.js";
import { createAuditLog } from "./auditLogController.js";

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

export async function getServiceLineById(req, res) {
  try {
    const { id } = req.params;
    const serviceLine = await ServiceLine.findByPk(id);
    if (!serviceLine) {
      return res.status(404).json({ error: "Service Line não encontrada" });
    }
    res.json(serviceLine);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao obter service line" });
  }
}

export async function createServiceLine(req, res) {
  try {
    const { learning_path_id, name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Nome é obrigatório" });
    }
    if (!learning_path_id) {
      return res.status(400).json({ error: "Learning Path é obrigatório" });
    }

    const learningPath = await LearningPath.findByPk(learning_path_id);
    if (!learningPath) {
      return res.status(400).json({ error: "Learning Path não encontrado" });
    }

    const serviceLine = await ServiceLine.create({
      learning_path_id,
      name: name.trim(),
      description: description || null,
    });

    await createAuditLog(req, res, {
      action: "CRIAR_SERVICE_LINE",
      entity: "ServiceLine",
      userId: req.userId,
      entityId: serviceLine.id,
      description: `Service Line #${serviceLine.id} (${serviceLine.name}) criada`,
      newValues: serviceLine.toJSON(),
    });

    res.status(201).json(serviceLine);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar service line" });
  }
}

export async function updateServiceLine(req, res) {
  try {
    const { id } = req.params;
    const { learning_path_id, name, description } = req.body;

    const serviceLine = await ServiceLine.findByPk(id);
    if (!serviceLine) {
      return res.status(404).json({ error: "Service Line não encontrada" });
    }

    if (name !== undefined && !name.trim()) {
      return res.status(400).json({ error: "Nome é obrigatório" });
    }

    if (learning_path_id !== undefined) {
      const learningPath = await LearningPath.findByPk(learning_path_id);
      if (!learningPath) {
        return res.status(400).json({ error: "Learning Path não encontrado" });
      }
    }

    const oldValues = serviceLine.toJSON();

    if (name !== undefined) serviceLine.name = name.trim();
    if (description !== undefined) serviceLine.description = description || null;
    if (learning_path_id !== undefined) serviceLine.learning_path_id = learning_path_id;
    await serviceLine.save();

    await createAuditLog(req, res, {
      action: "ATUALIZAR_SERVICE_LINE",
      entity: "ServiceLine",
      userId: req.userId,
      entityId: serviceLine.id,
      description: `Service Line #${serviceLine.id} (${serviceLine.name}) atualizada`,
      oldValues,
      newValues: serviceLine.toJSON(),
    });

    res.json(serviceLine);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar service line" });
  }
}

export async function deleteServiceLine(req, res) {
  try {
    const { id } = req.params;

    const serviceLine = await ServiceLine.findByPk(id);
    if (!serviceLine) {
      return res.status(404).json({ error: "Service Line não encontrada" });
    }

    const areasCount = await Area.count({ where: { service_line_id: id } });
    if (areasCount > 0) {
      return res.status(409).json({
        error: "Não é possível apagar: existem Áreas associadas a esta Service Line.",
      });
    }

    const oldValues = serviceLine.toJSON();
    await serviceLine.destroy();

    await createAuditLog(req, res, {
      action: "ELIMINAR_SERVICE_LINE",
      entity: "ServiceLine",
      userId: req.userId,
      entityId: id,
      description: `Service Line #${id} (${oldValues.name}) eliminada`,
      oldValues,
    });

    res.json({ message: "Service Line eliminada com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao eliminar service line" });
  }
}
