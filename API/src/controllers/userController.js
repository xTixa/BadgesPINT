import User from "../models/User.js";

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
