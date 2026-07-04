import { LearningPath, ServiceLine, Area, Badge, Requirement } from "../models/index.js";
import { createAuditLog } from "./auditLogController.js";

// Lista todos os Learning Paths (só há 1 bruh)
export async function getLearningPaths(req, res) {
  try {
    const paths = await LearningPath.findAll({ order: [["name", "ASC"]] });
    res.json(paths);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao obter learning paths" });
  }
}

// Obter um Learning Path por id
export async function getLearningPathById(req, res) {
  try {
    const { id } = req.params;
    const learningPath = await LearningPath.findByPk(id);
    if (!learningPath) {
      return res.status(404).json({ error: "Learning Path não encontrado" });
    }
    res.json(learningPath);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao obter learning path" });
  }
}

// Criar Learning Path
export async function createLearningPath(req, res) {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Nome é obrigatório" });
    }

    const learningPath = await LearningPath.create({
      name: name.trim(),
      description: description || null,
    });

    await createAuditLog(req, res, {
      action: "CRIAR_LEARNING_PATH",
      entity: "LearningPath",
      userId: req.userId,
      entityId: learningPath.id,
      description: `Learning Path #${learningPath.id} (${learningPath.name}) criado`,
      newValues: learningPath.toJSON(),
    });

    res.status(201).json(learningPath);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar learning path" });
  }
}

// Atualizar Learning Path
export async function updateLearningPath(req, res) {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const learningPath = await LearningPath.findByPk(id);
    if (!learningPath) {
      return res.status(404).json({ error: "Learning Path não encontrado" });
    }

    if (name !== undefined && !name.trim()) {
      return res.status(400).json({ error: "Nome é obrigatório" });
    }

    const oldValues = learningPath.toJSON();

    if (name !== undefined) learningPath.name = name.trim();
    if (description !== undefined) learningPath.description = description || null;
    await learningPath.save();

    await createAuditLog(req, res, {
      action: "ATUALIZAR_LEARNING_PATH",
      entity: "LearningPath",
      userId: req.userId,
      entityId: learningPath.id,
      description: `Learning Path #${learningPath.id} (${learningPath.name}) atualizado`,
      oldValues,
      newValues: learningPath.toJSON(),
    });

    res.json(learningPath);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar learning path" });
  }
}

// Apagar Learning Path
export async function deleteLearningPath(req, res) {
  try {
    const { id } = req.params;

    const learningPath = await LearningPath.findByPk(id);
    if (!learningPath) {
      return res.status(404).json({ error: "Learning Path não encontrado" });
    }

    const serviceLinesCount = await ServiceLine.count({ where: { learning_path_id: id } });
    if (serviceLinesCount > 0) {
      return res.status(409).json({
        error: "Não é possível apagar: existem Service Lines associadas a este Learning Path.",
      });
    }

    const oldValues = learningPath.toJSON();
    await learningPath.destroy();

    await createAuditLog(req, res, {
      action: "ELIMINAR_LEARNING_PATH",
      entity: "LearningPath",
      userId: req.userId,
      entityId: id,
      description: `Learning Path #${id} (${oldValues.name}) eliminado`,
      oldValues,
    });

    res.json({ message: "Learning Path eliminado com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao eliminar learning path" });
  }
}

// Lista Service Lines de um LP
export async function getServiceLinesByLearningPath(req, res) {
  try {
    const { id } = req.params;
    const serviceLines = await ServiceLine.findAll({ where: { learning_path_id: id } });
    res.json(serviceLines);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao obter service lines" });
  }
}

// Retorna a árvore do LP toda (service lines -> areas -> badges -> requirements)
export async function getLearningPathTree(req, res) {
  try {
    const { id } = req.params;

    const learningPath = await LearningPath.findByPk(id, {
      include: {
        model: ServiceLine,
        as: "serviceLines",
        include: {
          model: Area,
          as: "areas",
          include: {
            model: Badge,
            as: "badges",
            include: {
              model: Requirement,
              as: "requirements",
            },
          },
        },
      },
    });

    if (!learningPath) {
      return res.status(404).json({ error: "Learning Path não encontrado" });
    }

    res.json(learningPath);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao obter árvore do Learning Path" });
  }
}