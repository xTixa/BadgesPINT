import { Area, ServiceLine, Badge, User } from "../models/index.js";
import { createAuditLog } from "./auditLogController.js";

export async function getAllAreas(req, res) {
  try {
    const areas = await Area.findAll({
      order: [["name", "ASC"]]
    });
    res.json(areas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao obter áreas" });
  }
}

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

export async function getAreaById(req, res) {
  try {
    const { id } = req.params;
    const area = await Area.findByPk(id);
    if (!area) {
      return res.status(404).json({ error: "Área não encontrada" });
    }
    res.json(area);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao obter área" });
  }
}

export async function createArea(req, res) {
  try {
    const { service_line_id, name, parent_id } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Nome é obrigatório" });
    }
    if (!service_line_id) {
      return res.status(400).json({ error: "Service Line é obrigatória" });
    }

    const serviceLine = await ServiceLine.findByPk(service_line_id);
    if (!serviceLine) {
      return res.status(400).json({ error: "Service Line não encontrada" });
    }

    if (parent_id) {
      const parent = await Area.findByPk(parent_id);
      if (!parent) {
        return res.status(400).json({ error: "Área pai não encontrada" });
      }
    }

    const area = await Area.create({
      service_line_id,
      name: name.trim(),
      parent_id: parent_id || null,
    });

    await createAuditLog(req, res, {
      action: "CRIAR_AREA",
      entity: "Area",
      userId: req.userId,
      entityId: area.id,
      description: `Área #${area.id} (${area.name}) criada`,
      newValues: area.toJSON(),
    });

    res.status(201).json(area);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar área" });
  }
}

export async function updateArea(req, res) {
  try {
    const { id } = req.params;
    const { service_line_id, name, parent_id } = req.body;

    const area = await Area.findByPk(id);
    if (!area) {
      return res.status(404).json({ error: "Área não encontrada" });
    }

    if (name !== undefined && !name.trim()) {
      return res.status(400).json({ error: "Nome é obrigatório" });
    }

    if (service_line_id !== undefined) {
      const serviceLine = await ServiceLine.findByPk(service_line_id);
      if (!serviceLine) {
        return res.status(400).json({ error: "Service Line não encontrada" });
      }
    }

    if (parent_id !== undefined && parent_id !== null) {
      if (Number(parent_id) === Number(id)) {
        return res.status(400).json({ error: "Uma área não pode ser sua própria área pai" });
      }
      const parent = await Area.findByPk(parent_id);
      if (!parent) {
        return res.status(400).json({ error: "Área pai não encontrada" });
      }
      const badgesCount = await Badge.count({ where: { area_id: id } });
      if (badgesCount > 0) {
        return res.status(409).json({ error: "Não é possível definir uma área pai: esta área já tem Badges associados." });
      }
    }

    const oldValues = area.toJSON();

    if (name !== undefined) area.name = name.trim();
    if (service_line_id !== undefined) area.service_line_id = service_line_id;
    if (parent_id !== undefined) area.parent_id = parent_id || null;
    await area.save();

    await createAuditLog(req, res, {
      action: "ATUALIZAR_AREA",
      entity: "Area",
      userId: req.userId,
      entityId: area.id,
      description: `Área #${area.id} (${area.name}) atualizada`,
      oldValues,
      newValues: area.toJSON(),
    });

    res.json(area);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar área" });
  }
}

export async function deleteArea(req, res) {
  try {
    const { id } = req.params;

    const area = await Area.findByPk(id);
    if (!area) {
      return res.status(404).json({ error: "Área não encontrada" });
    }

    const [badgesCount, usersCount, subareasCount] = await Promise.all([
      Badge.count({ where: { area_id: id } }),
      User.count({ where: { area_id: id } }),
      Area.count({ where: { parent_id: id } }),
    ]);

    if (badgesCount > 0 || usersCount > 0 || subareasCount > 0) {
      return res.status(409).json({
        error: "Não é possível apagar: existem Badges, Utilizadores ou Subáreas associados a esta Área.",
      });
    }

    const oldValues = area.toJSON();
    await area.destroy();

    await createAuditLog(req, res, {
      action: "ELIMINAR_AREA",
      entity: "Area",
      userId: req.userId,
      entityId: id,
      description: `Área #${id} (${oldValues.name}) eliminada`,
      oldValues,
    });

    res.json({ message: "Área eliminada com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao eliminar área" });
  }
}
