import User from "../models/User.js";
import Badge from "../models/Badge.js";
import LearningPath from "../models/LearningPath.js";
import bcryptjs from "bcryptjs";

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
      attributes: ["id", "name", "email", "role", "area_id", "points_total", "createdAt", "updatedAt"],
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
    const { name, email, role, password, area_id } = req.body;

    if (!name || !email || !role || !password) {
      return res.status(400).json({ message: "Dados incompletos." });
    }

    const exists = await User.findOne({ where: { email } });
    if (exists)
      return res.status(400).json({ message: "Email já existe." });

    const hash = await bcryptjs.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      role,
      password_hash: hash,
      area_id: area_id || null
    });

    res.status(201).json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      area_id: newUser.area_id
    });

  } catch (err) {
    console.error("Erro ao criar user:", err);
    res.status(500).json({ message: "Erro ao criar utilizador" });
  }
}

/**
 * Atualizar utilizador
 */
export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { name, email, role, password, area_id } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "Utilizador não encontrado" });
    }

    // Verificar se email já existe (se está a ser alterado)
    if (email && email !== user.email) {
      const exists = await User.findOne({ where: { email } });
      if (exists) {
        return res.status(400).json({ message: "Email já existe." });
      }
    }

    // Atualizar campos
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (area_id) user.area_id = area_id;
    if (password) user.password_hash = await bcryptjs.hash(password, 10);

    await user.save();

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      area_id: user.area_id
    });

  } catch (err) {
    console.error("Erro ao atualizar user:", err);
    res.status(500).json({ message: "Erro ao atualizar utilizador" });
  }
}

/**
 * Apagar utilizador
 */
export async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "Utilizador não encontrado" });
    }

    await user.destroy();

    res.json({ message: "Utilizador removido com sucesso" });

  } catch (err) {
    console.error("Erro ao apagar user:", err);
    res.status(500).json({ message: "Erro ao apagar utilizador" });
  }
}
