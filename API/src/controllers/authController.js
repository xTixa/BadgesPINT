import User from "../models/User.js";
import bcrypt from "bcryptjs";

export async function login(req, res) {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user)
      return res.status(400).json({ error: "Credenciais inválidas" });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid)
      return res.status(400).json({ error: "Credenciais inválidas" });

    // Retorna apenas os dados necessários
    return res.json({
      message: "Login efetuado",
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        area_id: user.area_id,
        points_total: user.points_total
      }
    });

  } catch (err) {
    console.error("Erro login:", err);
    res.status(500).json({ error: "Erro interno" });
  }
}
