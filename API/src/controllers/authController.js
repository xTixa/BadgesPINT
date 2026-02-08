import User from "../models/User.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { generateToken } from "../utils/generateToken.js";
import ConsultorBadge from "../models/ConsultorBadge.js";
import Badge from "../models/Badge.js";
import PasswordReset from "../models/PasswordReset.js";
import { createAuditLog } from "./auditLogController.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      await createAuditLog(req, res, {
        action: "LOGIN",
        entity: "User",
        description: `Login falhado para email ${email}`,
        status: "failure",
      });
      return res.status(404).json({ message: "Utilizador não encontrado" });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      await createAuditLog(req, res, {
        action: "LOGIN",
        entity: "User",
        userId: user.id,
        entityId: user.id,
        description: "Password incorreta",
        status: "failure",
      });
      return res.status(401).json({ message: "Password incorreta" });
    }

    let greeting = "";
    const now = new Date();

    // Se for password temporária → Primeiro login
    if (password === "123456") {
      greeting = "Bem-vindo";
      const token = generateToken(user);

      return res.json({
        firstLogin: true,
        token,
        greeting,
        user
      });
    }

    // Verificar último login
    if (!user.last_login) {
      greeting = "Bem-vindo";
    } else {
      const diffDays =
        (now - new Date(user.last_login)) / (1000 * 60 * 60 * 24);

      if (diffDays >= 15) {
        greeting = "Seja bem-vindo novamente";
      } else {
        const hour = now.getHours();
        if (hour < 12) greeting = "Bom dia";
        else if (hour < 18) greeting = "Boa tarde";
        else greeting = "Boa noite";
      }
    }

    // Atualizar last_login
    await user.update({ last_login: now });

    const token = generateToken(user);
    await createAuditLog(req, res, {
      action: "LOGIN",
      entity: "User",
      userId: user.id,
      entityId: user.id,
      description: "Login bem-sucedido",
      status: "success",
    });
    return res.json({ token, user, greeting });

  } catch (error) {
    console.error("Erro login:", error);
    res.status(500).json({ message: "Erro servidor." });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;

    const hash = await bcrypt.hash(newPassword, 10);

    await User.update(
      { password_hash: hash },
      { where: { id: userId } }
    );

    res.json({ message: "Password atualizada com sucesso!" });

  } catch (error) {
    console.error("Erro ao atualizar password:", error);
    res.status(500).json({ message: "Erro servidor." });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: ["id", "name", "email", "role", "area_id", "points_total"]
    });

    if (!user) return res.status(404).json({ message: "Utilizador não encontrado" });

    // Buscar badges obtidos
    const badgesObtidos = await ConsultorBadge.count({
      where: { consultor_id: user.id, status: "obtido" }
    });

    // Buscar total de badges disponíveis
    const totalBadges = await Badge.count();

    // Calcular progresso (exemplo: baseado em badges obtidos vs total)
    const progresso = totalBadges > 0 ? Math.round((badgesObtidos / totalBadges) * 100) : 0;

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      area_id: user.area_id,
      points_total: user.points_total || 0,
      localizacao: "",
      badges: badgesObtidos,
      progresso,
    });
  } catch (err) {
    console.error("Erro no perfil:", err);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

export async function firstLogin(req, res) {
  try {
    const { newPassword } = req.body;

    // userId vem do token via authMiddleware
    const userId = req.userId;

    if (!newPassword) {
      return res.status(400).json({ message: "Nova password em falta." });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilizador não encontrado." });
    }

    const hash = await bcrypt.hash(newPassword, 10);

    await user.update({
      password_hash: hash,
    });

    const token = generateToken(user);

    return res.json({
      message: "Password atualizada com sucesso!",
      token,
      user,
    });

  } catch (err) {
    console.error("Erro no firstLogin:", err);
    res.status(500).json({ message: "Erro no servidor." });
  }
}

export const recoverPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email é obrigatório." });
    }

    const user = await User.findOne({ where: { email } });

    // Resposta genérica para não expor existência de utilizador
    if (!user) {
      return res.json({ message: "Se o email existir, enviámos instruções." });
    }

    // Invalidar tokens antigos
    await PasswordReset.update(
      { used_at: new Date() },
      { where: { user_id: user.id, used_at: null } }
    );

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h

    await PasswordReset.create({
      user_id: user.id,
      token_hash: tokenHash,
      expires_at: expiresAt,
    });

    // TODO: Enviar email com link/token de reset. Para ambiente dev, devolvemos token.
    const payload = { message: "Se o email existir, enviámos instruções." };
    if (process.env.NODE_ENV !== "production") {
      payload.resetToken = rawToken;
    }

    return res.json(payload);
  } catch (err) {
    console.error("Erro recoverPassword:", err);
    res.status(500).json({ message: "Erro interno." });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token e nova password são obrigatórios." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password deve ter pelo menos 6 caracteres." });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const reset = await PasswordReset.findOne({
      where: {
        token_hash: tokenHash,
        used_at: null,
      },
      order: [["createdAt", "DESC"]],
    });

    if (!reset) {
      await createAuditLog(req, res, {
        action: "RESET_PASSWORD",
        entity: "User",
        description: "Token inválido ou já utilizado",
        status: "failure",
      });
      return res.status(400).json({ message: "Token inválido ou já utilizado." });
    }

    if (new Date(reset.expires_at) < new Date()) {
      await createAuditLog(req, res, {
        action: "RESET_PASSWORD",
        entity: "User",
        userId: reset.user_id,
        entityId: reset.user_id,
        description: "Token expirado",
        status: "failure",
      });
      return res.status(400).json({ message: "Token expirado." });
    }

    const user = await User.findByPk(reset.user_id);
    if (!user) {
      return res.status(404).json({ message: "Utilizador não encontrado." });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await user.update({ password_hash: hash });

    await reset.update({ used_at: new Date() });

    const tokenJwt = generateToken(user);

    await createAuditLog(req, res, {
      action: "RESET_PASSWORD",
      entity: "User",
      userId: user.id,
      entityId: user.id,
      description: "Password redefinida",
      status: "success",
    });

    return res.json({ message: "Password redefinida com sucesso.", token: tokenJwt, user });
  } catch (err) {
    console.error("Erro resetPassword:", err);
    res.status(500).json({ message: "Erro interno." });
  }
};

export const logout = async (req, res) => {
  try {
    await createAuditLog(req, res, {
      action: "LOGOUT",
      entity: "User",
      userId: req.userId || null,
      entityId: req.userId || null,
      description: "Logout iniciado pelo utilizador",
      status: "success",
    });

    // Sem invalidar token (JWT stateless); front deve limpar storage.
    return res.json({ message: "Sessão terminada." });
  } catch (err) {
    console.error("Erro logout:", err);
    res.status(500).json({ message: "Erro interno." });
  }
};


