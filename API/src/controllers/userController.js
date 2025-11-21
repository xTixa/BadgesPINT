import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const registerConsultant = async (req, res) => {
  try {
    const { nome, email } = req.body;

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
      area_id: null,
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
