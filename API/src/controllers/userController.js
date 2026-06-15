import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const registerConsultant = async (req, res) => {
  try {
    const { nome, email, area_id } = req.body;

    // Verifica duplicado
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: "Email já existe." });

    // Password automática
    const generatedPassword = "123456";
    const hash = await bcrypt.hash(generatedPassword, 10);

    const newUser = await User.create({
      name: nome,
      email,
      password_hash: hash,
      role: "consultant",
      area_id: area_id || null,
      points_total: 0,
    });

    res.status(201).json({
      message: "Utilizador criado com sucesso.",
      temporaryPassword: generatedPassword,
      user: newUser,
    });

  } catch (err) {
    console.error("Erro ao registar utilizador:", err);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export async function getAllUsers(req, res) {
  try {
    const users = await User.findAll({
      attributes: ["id", "name", "email", "role", "area_id", "points_total"],
      order: [["id", "ASC"]],
    });

    res.json(users);
  } catch (err) {
    console.error("Erro ao carregar utilizadores:", err);
    res.status(500).json({ error: "Erro ao carregar utilizadores" });
  }
}

// Atualizar perfil do utilizador
export const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, area_id } = req.body;
    const requestingUserId = req.userId;

    // Verificar se o utilizador está a editar o próprio perfil
    if (parseInt(id) !== requestingUserId) {
      return res.status(403).json({ message: "Não pode editar perfil de outro utilizador" });
    }

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
    if (area_id !== undefined) user.area_id = area_id || null;

    await user.save();

    res.json({
      success: true,
      message: "Perfil atualizado com sucesso",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        area_id: user.area_id,
        points_total: user.points_total || 0,
      },
    });
  } catch (err) {
    console.error("Erro ao atualizar perfil:", err);
    res.status(500).json({ message: "Erro ao atualizar perfil" });
  }
};

// Alterar password
export const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;
    const requestingUserId = req.userId;

    // Verificar se o utilizador está a alterar a própria password
    if (parseInt(id) !== requestingUserId) {
      return res.status(403).json({ message: "Não pode alterar password de outro utilizador" });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "Utilizador não encontrado" });
    }

    // Verificar password atual
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Password atual incorreta" });
    }

    // Validar nova password
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "Nova password deve ter pelo menos 6 caracteres" });
    }

    // Atualizar password
    const hash = await bcrypt.hash(newPassword, 10);
    user.password_hash = hash;
    await user.save();

    res.json({
      success: true,
      message: "Password alterada com sucesso",
    });
  } catch (err) {
    console.error("Erro ao alterar password:", err);
    res.status(500).json({ message: "Erro ao alterar password" });
  }
};
