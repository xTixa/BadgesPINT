import User from "../models/User.js";
import Badge from "../models/Badge.js";
import LearningPath from "../models/LearningPath.js";

export async function getAdminStats(req, res) {
  try {
    const [totalUsers, totalBadges, totalLearningPaths] = await Promise.all([
      User.count(),
      Badge.count(),
      LearningPath.count(),
    ]);

    res.json({
      totalUsers,
      totalBadges,
      totalLearningPaths,
    });
  } catch (err) {
    console.error("Erro ao carregar estatísticas do admin:", err);
    res.status(500).json({ error: "Erro ao carregar estatísticas" });
  }
}
