import User from "../models/User.js";
import Badge from "../models/Badge.js";
import LearningPath from "../models/LearningPath.js";

/**
 * Dashboard stats do Administrador
 */
export async function getAdminStats(req, res) {
  try {
    const totalUsers = await User.count();
    const totalBadges = await Badge.count();
    const totalLearningPaths = await LearningPath.count();

    res.json({
      totalUsers,
      totalBadges,
      totalLearningPaths
    });

  } catch (err) {
    console.error("Erro no Admin Stats:", err);
    res.status(500).json({ message: "Erro ao carregar estatísticas" });
  }
}

/**
 * Gestão de utilizadores - listar
 */
export async function getAllUsers(req, res) {
  try {
    const users = await User.findAll({
      attributes: ["id", "name", "email", "role", "area_id", "points_total"],
      order: [["id", "ASC"]]
    });

    res.json(users);

  } catch (err) {
    console.error("Erro ao listar users:", err);
    res.status(500).json({ message: "Erro ao carregar utilizadores" });
  }
}

/**
 * Criar utilizador
 */
export async function createUser(req, res) {
  try {
    const { name, email, role, password } = req.body;

    if (!name || !email || !role || !password) {
      return res.status(400).json({ message: "Dados incompletos." });
    }

    const exists = await User.findOne({ where: { email } });
    if (exists)
      return res.status(400).json({ message: "Email já existe." });

    const bcrypt = await import("bcryptjs");
    const hash = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      role,
      password_hash: hash
    });

    res.status(201).json(newUser);

  } catch (err) {
    console.error("Erro ao criar user:", err);
    res.status(500).json({ message: "Erro ao criar utilizador" });
  }
}

/**
 * Apagar utilizador
 */
export async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    await User.destroy({ where: { id } });

    res.json({ message: "Utilizador removido com sucesso" });

  } catch (err) {
    console.error("Erro ao apagar user:", err);
    res.status(500).json({ message: "Erro ao apagar utilizador" });
  }
}
