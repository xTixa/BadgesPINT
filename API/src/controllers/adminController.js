import User from "../models/User.js";
import Badge from "../models/Badge.js";
import LearningPath from "../models/LearningPath.js";
import ConsultorBadge from "../models/ConsultorBadge.js";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import database from "../config/database.js";
import { QueryTypes, Op, fn, col } from "sequelize";
import {
  getMailErrorDetails,
  isEmailConfigured,
  sendMail,
  sendTemporaryPasswordEmail,
} from "../services/mailService.js";
import { createAuditLog } from "./auditLogController.js";

const generateTemporaryPassword = () => crypto.randomBytes(6).toString("base64url");

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
    const totalBadgeApplications = await ConsultorBadge.count();
    const badgeApprovalPercentage = totalBadgeApplications > 0
      ? Math.round((badgesObtidosTotal / totalBadgeApplications) * 100)
      : 0;

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

    const badgesByRange = await ConsultorBadge.count({
      where: {
        status: "obtido",
        data_atribuicao: {
          [Op.between]: [start, end],
        },
      },
    });

    const monthly = buildMonthlySeries(badgesByMonthRaw, start, end).map((row) => ({
      ...row,
      completionRate: badgesByRange > 0 ? Math.round((row.count / badgesByRange) * 100) : 0,
    }));

    // Badges por Learning Path
    const badgesByLearningPath = await database.query(
      `SELECT lp.id, lp.name, COUNT(DISTINCT b.id)::int AS count
       FROM learning_paths lp
       LEFT JOIN service_lines sl ON sl.learning_path_id = lp.id
       LEFT JOIN areas a ON a.service_line_id = sl.id
       LEFT JOIN badges b ON b.area_id = a.id
       GROUP BY lp.id, lp.name
       ORDER BY lp.name`,
      { type: QueryTypes.SELECT }
    );

    // Badges por nível
    const badgesByLevel = await database.query(
      `SELECT b.level, COUNT(b.id)::int AS count
       FROM badges b
       GROUP BY b.level
       ORDER BY CASE b.level
         WHEN 'Junior' THEN 1 WHEN 'Intermedio' THEN 2 WHEN 'Senior' THEN 3
         WHEN 'Especialista' THEN 4 WHEN 'Lider' THEN 5 ELSE 6 END`,
      { type: QueryTypes.SELECT }
    );

    const badgesByLearningPathAndLevel = await database.query(
      `SELECT lp.id AS learning_path_id, lp.name AS learning_path_name,
              b.level, COUNT(DISTINCT b.id)::int AS count
       FROM learning_paths lp
       LEFT JOIN service_lines sl ON sl.learning_path_id = lp.id
       LEFT JOIN areas a ON a.service_line_id = sl.id
       LEFT JOIN badges b ON b.area_id = a.id
       GROUP BY lp.id, lp.name, b.level
       ORDER BY lp.name, CASE b.level
         WHEN 'Junior' THEN 1 WHEN 'Intermedio' THEN 2 WHEN 'Senior' THEN 3
         WHEN 'Especialista' THEN 4 WHEN 'Lider' THEN 5 ELSE 6 END`,
      { type: QueryTypes.SELECT }
    );

    res.json({
      summary: {
        totalUsers,
        totalBadges,
        totalLearningPaths,
        badgesObtidosTotal,
        totalBadgeApplications,
        badgeApprovalPercentage,
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
      badgesByLearningPathAndLevel,
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
      where: { anonymized_at: null },
      order: [["id", "ASC"]]
    });

    res.json(users);

  } catch (err) {
    console.error("Erro ao listar users:", err);
    res.status(500).json({ message: "Erro ao carregar utilizadores" });
  }
}

/**
 * Gestao de utilizadores - obter ficha
 */
export async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: ["id", "name", "email", "role", "area_id", "points_total", "createdAt", "updatedAt"],
    });

    if (!user) {
      return res.status(404).json({ message: "Utilizador nao encontrado" });
    }

    res.json(user);
  } catch (err) {
    console.error("Erro ao obter user:", err);
    res.status(500).json({ message: "Erro ao carregar utilizador" });
  }
}

/**
 * Criar utilizador
 */
export async function createUser(req, res) {
  try {
    const { name, email, role, password, area_id } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ message: "Dados incompletos." });
    }

    if (role === "service_line_leader" && !area_id) {
      return res.status(400).json({ message: "Service Line Leader deve ter uma área associada." });
    }

    const exists = await User.findOne({ where: { email } });
    if (exists)
      return res.status(400).json({ message: "Email já existe." });

    const temporaryPassword = password || generateTemporaryPassword();
    const hash = await bcryptjs.hash(temporaryPassword, 10);

    const newUser = await User.create({
      name,
      email,
      role,
      password_hash: hash,
      area_id: area_id || null
    });

    await createAuditLog(req, res, {
      action: "CRIAR_UTILIZADOR",
      entity: "User",
      userId: req.userId,
      entityId: newUser.id,
      description: `Utilizador #${newUser.id} (${newUser.email}) criado com role ${newUser.role}`,
      newValues: { name: newUser.name, email: newUser.email, role: newUser.role, area_id: newUser.area_id },
    });

    const emailWillBeSent = isEmailConfigured();

    res.status(201).json({
      message: emailWillBeSent
        ? "Utilizador criado com sucesso. O email com a password temporaria vai ser enviado em breve."
        : "Utilizador criado, mas o email nao esta configurado no servidor.",
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      area_id: newUser.area_id,
      emailSent: false,
      emailPending: emailWillBeSent,
    });

    if (emailWillBeSent) {
      sendTemporaryPasswordEmail({
        to: newUser.email,
        name: newUser.name,
        temporaryPassword,
      }).catch((mailError) => {
        console.error(
          "Utilizador criado, mas email de convite falhou:",
          getMailErrorDetails(mailError),
        );
      });
    }

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

    const oldValues = { name: user.name, email: user.email, role: user.role, area_id: user.area_id };

    // Atualizar campos
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (role === "service_line_leader" && !area_id && !user.area_id) {
      return res.status(400).json({ message: "Service Line Leader deve ter uma área associada." });
    }
    if (area_id !== undefined) user.area_id = area_id || null;
    if (password) user.password_hash = await bcryptjs.hash(password, 10);

    await user.save();

    await createAuditLog(req, res, {
      action: "ATUALIZAR_UTILIZADOR",
      entity: "User",
      userId: req.userId,
      entityId: user.id,
      description: `Utilizador #${user.id} (${user.email}) atualizado`,
      oldValues,
      newValues: { name: user.name, email: user.email, role: user.role, area_id: user.area_id },
    });

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
 * Apagar utilizador — anonimização (RGPD) em vez de hard delete: os
 * registos ligados (badges, evidências, tickets, auditoria) mantêm-se para
 * integridade referencial e histórico/estatísticas, mas deixam de conter
 * dados pessoais identificáveis.
 */
export async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "Utilizador não encontrado" });
    }

    if (user.anonymized_at) {
      return res.status(400).json({ message: "Utilizador já foi removido/anonimizado" });
    }

    const oldValues = { name: user.name, email: user.email, role: user.role, area_id: user.area_id };
    const randomPassword = crypto.randomBytes(32).toString("hex");

    await user.update({
      name: "Utilizador removido",
      email: `utilizador-removido-${user.id}@anonimizado.local`,
      password_hash: await bcryptjs.hash(randomPassword, 10),
      avatar_url: null,
      goal_text: null,
      goal_deadline: null,
      public_profile_enabled: false,
      linkedin_sharing_enabled: false,
      rgpd_publication_accepted: false,
      anonymized_at: new Date(),
    });

    await createAuditLog(req, res, {
      action: "ANONIMIZAR_UTILIZADOR",
      entity: "User",
      userId: req.userId,
      entityId: id,
      description: `Utilizador #${id} (${oldValues.email}) anonimizado (RGPD) em vez de eliminado`,
      oldValues,
    });

    res.json({ message: "Utilizador removido (anonimizado) com sucesso" });

  } catch (err) {
    console.error("Erro ao apagar user:", err);
    res.status(500).json({ message: "Erro ao apagar utilizador" });
  }
}

export async function testEmailConfig(req, res) {
  try {
    const { to } = req.body;

    if (!to) {
      return res.status(400).json({ message: "Email de destino obrigatorio." });
    }

    if (!isEmailConfigured()) {
      return res.status(400).json({
        message: "Servico de email nao configurado no servidor.",
        emailConfigured: false,
      });
    }

    const info = await sendMail({
      to,
      subject: "Teste SMTP - Badges Softinsa",
      text: "Este e um email de teste da plataforma Badges Softinsa.",
      html: "<p>Este e um email de teste da plataforma <strong>Badges Softinsa</strong>.</p>",
    });

    res.json({
      success: true,
      emailConfigured: true,
      accepted: info.accepted,
      rejected: info.rejected,
      messageId: info.messageId,
    });
  } catch (err) {
    console.error("Erro no teste de email:", err);
    res.status(500).json({
      success: false,
      emailConfigured: isEmailConfigured(),
      message: "Falha ao enviar email de teste.",
      detail: process.env.NODE_ENV === "production" ? undefined : err.message,
      code: err.code,
      command: err.command,
      responseCode: err.responseCode,
    });
  }
}
