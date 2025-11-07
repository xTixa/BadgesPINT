import LearningPath from "../models/LearningPath.js";

export const getLearningPaths = async (req, res) => {
  try {
    const paths = await LearningPath.findAll();
    res.json(paths);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar Learning Paths" });
  }
};
