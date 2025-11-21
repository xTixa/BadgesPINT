import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "Utilizador não encontrado" });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ message: "Password incorreta" });

    let greeting = "";
    const now = new Date();

    // Se for password temporária → Primeiro login
    if (password === "123456") {
      greeting = "Bem-vindo!";
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
      greeting = "Bem-vindo!";
    } else {
      const diffDays =
        (now - new Date(user.last_login)) / (1000 * 60 * 60 * 24);

      if (diffDays >= 15) {
        greeting = "Seja bem-vindo novamente!";
      } else {
        const hour = now.getHours();
        if (hour < 12) greeting = "Bom dia!";
        else if (hour < 18) greeting = "Boa tarde!";
        else greeting = "Boa noite!";
      }
    }

    // Atualizar last_login
    await user.update({ last_login: now });

    const token = generateToken(user);
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

    res.json(user);
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


