import { QueryTypes } from "sequelize";
import database from "../config/database.js";
import User from "../models/User.js";
import { getEmailSignature } from "../services/mailService.js";

async function loadObtainedBadges(userId) {
  return database.query(
    `SELECT b.id, COALESCE(b.name, b.description, 'Badge #' || b.id) AS name,
            b.level, b.image_url, cb.data_atribuicao
     FROM consultor_badges cb
     JOIN badges b ON b.id = cb.badge_id
     WHERE cb.consultor_id = :userId AND cb.status = 'obtido'
     ORDER BY cb.data_atribuicao DESC NULLS LAST, b.id DESC`,
    { replacements: { userId }, type: QueryTypes.SELECT },
  );
}

function selectedBadges(user, available) {
  const selectedIds = Array.isArray(user.email_signature_badge_ids)
    ? user.email_signature_badge_ids.map(Number)
    : [];
  if (!selectedIds.length) return available.slice(0, 4);
  const positions = new Map(selectedIds.map((id, index) => [id, index]));
  return available.filter((badge) => positions.has(Number(badge.id)))
    .sort((a, b) => positions.get(Number(a.id)) - positions.get(Number(b.id))).slice(0, 6);
}

function responseFor(user, available) {
  const badges = selectedBadges(user, available);
  return {
    enabled: Boolean(user.email_signature_enabled),
    selected_badge_ids: badges.map((badge) => Number(badge.id)),
    available_badges: available,
    html: getEmailSignature({ user, badges }),
    plain_text: `${user.name}\n${user.email}\nBadges: ${badges.map((badge) => badge.name).join(", ") || "Sem badges"}`,
  };
}

export async function getMyEmailSignature(req, res) {
  try {
    const user = await User.findByPk(req.userId);
    if (!user || user.role !== "consultant") return res.status(404).json({ message: "Consultor não encontrado" });
    res.json(responseFor(user, await loadObtainedBadges(user.id)));
  } catch (error) {
    console.error("Erro ao carregar assinatura de email:", error);
    res.status(500).json({ message: "Erro ao carregar assinatura de email" });
  }
}

export async function updateMyEmailSignature(req, res) {
  try {
    const user = await User.findByPk(req.userId);
    if (!user || user.role !== "consultant") return res.status(404).json({ message: "Consultor não encontrado" });
    const available = await loadObtainedBadges(user.id);
    const availableIds = new Set(available.map((badge) => Number(badge.id)));
    const requestedIds = [...new Set((req.body?.badge_ids || []).map(Number))].filter((id) => availableIds.has(id));
    if (requestedIds.length > 6) return res.status(400).json({ message: "Seleciona no máximo 6 badges" });
    user.email_signature_enabled = req.body?.enabled === true;
    user.email_signature_badge_ids = requestedIds;
    await user.save();
    res.json(responseFor(user, available));
  } catch (error) {
    console.error("Erro ao guardar assinatura de email:", error);
    res.status(500).json({ message: "Erro ao guardar assinatura de email" });
  }
}
