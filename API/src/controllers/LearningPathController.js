import { LearningPath, ServiceLine, Area, Badge, Requirement } from "../models/index.js";

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