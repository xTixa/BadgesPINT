import User from "../models/User.js";
import Badge from "../models/Badge.js";
import LearningPath from "../models/LearningPath.js";
import ConsultorBadge from "../models/ConsultorBadge.js";
import bcryptjs from "bcryptjs";
import database from "../config/database.js";
import { QueryTypes, Op, fn, col } from "sequelize";

const buildMonthlySeries = (rows, start, end) => {
  const result = [];
  const cursor = new Date(start.getTime());
  cursor.setDate(1);
  const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);

  const map = new Map(rows.map((r) => [r.month, Number(r.count) || 0]));

  while (cursor <= endMonth) {
    const label = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
    result.push({
      month: label,
      count: map.get(label) || 0,
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return result;
};

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
 * KPI detalhados para dashboards (badges por mês, por LP, por nível, etc.)
 */
export async function getAdminKpis(req, res) {
  try {
    const totalUsers = await User.count();
    const totalBadges = await Badge.count();
    const totalLearningPaths = await LearningPath.count();
    const badgesObtidosTotal = await ConsultorBadge.count({ where: { status: "obtido" } });

    // Utilizadores por role
    const usersByRole = await User.findAll({
      attributes: [
        "role",
        [fn("COUNT", col("id")), "count"],
      ],
      group: ["role"],
      raw: true,
    });

    // Badges obtidos por mês (YYYY-MM)
    const { startDate, endDate } = req.query;
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

    const badgesByMonthRaw = await database.query(
      "SELECT to_char(date_trunc('month', cb.data_atribuicao), 'YYYY-MM') AS month, COUNT(*)::int AS count FROM consultor_badges cb WHERE cb.status = 'obtido' AND cb.data_atribuicao IS NOT NULL AND cb.data_atribuicao BETWEEN :start AND :end GROUP BY 1 ORDER BY 1",
      { type: QueryTypes.SELECT, replacements: { start, end } }
    );

    const monthly = buildMonthlySeries(badgesByMonthRaw, start, end).map((row) => ({
      ...row,
      completionRate: totalBadges > 0 ? Math.round((row.count / totalBadges) * 100) : 0,
    }));

    const badgesByRange = await ConsultorBadge.count({
      where: {
        status: "obtido",
        data_atribuicao: {
          [Op.between]: [start, end],
        },
      },
    });

    // Badges por Learning Path
    const badgesByLearningPath = await database.query(
      `SELECT lp.id, lp.name, COUNT(cb.id)::int AS count
       FROM consultor_badges cb
       JOIN badges b ON b.id = cb.badge_id
       JOIN areas a ON a.id = b.area_id
       JOIN service_lines sl ON sl.id = a.service_line_id
       JOIN learning_paths lp ON lp.id = sl.learning_path_id
       WHERE cb.status = 'obtido'
       GROUP BY lp.id, lp.name
       ORDER BY lp.name`,
      { type: QueryTypes.SELECT }
    );

    // Badges por nível
    const badgesByLevel = await database.query(
      `SELECT b.level, COUNT(cb.id)::int AS count
       FROM consultor_badges cb
       JOIN badges b ON b.id = cb.badge_id
       WHERE cb.status = 'obtido'
       GROUP BY b.level
       ORDER BY b.level`,
      { type: QueryTypes.SELECT }
    );

    res.json({
      summary: {
        totalUsers,
        totalBadges,
        totalLearningPaths,
        badgesObtidosTotal,
      },
      usersByRole,
      badgesByMonth: monthly,
      badgesByRange: {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        count: badgesByRange,
      },
      badgesByLearningPath,
      badgesByLevel,
    });

  } catch (err) {
    console.error("Erro no Admin KPIs:", err);
    res.status(500).json({ message: "Erro ao carregar KPIs" });
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
