import { QueryTypes } from "sequelize";
import crypto from "crypto";
import database from "../config/database.js";
import User from "../models/User.js";
import Area from "../models/Area.js";
import { getEmailSignature } from "../services/mailService.js";
import { getTMAreaIds } from "./talentManagerController.js";

async function loadObtainedBadges(userId) {
  const rows = await database.query(
    `SELECT cb.id AS consultor_badge_id, b.id, COALESCE(b.description, 'Badge #' || b.id) AS name,
            b.level, b.image_url, cb.data_atribuicao, cb.certificate_code
     FROM consultor_badges cb
     JOIN badges b ON b.id = cb.badge_id
     WHERE cb.consultor_id = :userId AND cb.status = 'obtido'
     ORDER BY cb.data_atribuicao DESC NULLS LAST, b.id DESC`,
    { replacements: { userId }, type: QueryTypes.SELECT },
  );

  for (const row of rows) {
    if (row.certificate_code) continue;
    row.certificate_code = crypto.randomBytes(18).toString("base64url");
    await database.query(
      `UPDATE consultor_badges SET certificate_code = :code WHERE id = :id`,
      { replacements: { code: row.certificate_code, id: row.consultor_badge_id } },
    );
  }

  return rows;
}

async function loadResponsibleBadges(user) {
  let areaIds;
  if (user.role === "service_line_leader") {
    const area = user.area_id ? await Area.findByPk(user.area_id) : null;
    areaIds = await getTMAreaIds(user, area?.service_line_id || null);
  } else {
    areaIds = await getTMAreaIds(user);
  }

  if (!areaIds.length) return [];

  return database.query(
    `SELECT b.id, COALESCE(b.description, 'Badge #' || b.id) AS name,
            b.level, b.image_url, NULL::timestamp AS data_atribuicao, NULL AS certificate_code
     FROM badges b
     WHERE b.area_id IN (:areaIds)
     ORDER BY b.id DESC`,
    { replacements: { areaIds }, type: QueryTypes.SELECT },
  );
}

async function loadAvailableBadges(user) {
  if (user.role === "talent_manager" || user.role === "service_line_leader") {
    return loadResponsibleBadges(user);
  }
  return loadObtainedBadges(user.id);
}

function selectedBadges(user, available, explicitIds) {
  const configuredIds = explicitIds === undefined
    ? user.email_signature_badge_ids
    : explicitIds;
  if (!Array.isArray(configuredIds)) return available.slice(0, 4);
  const selectedIds = configuredIds.map(Number);
  const positions = new Map(selectedIds.map((id, index) => [id, index]));
  return available.filter((badge) => positions.has(Number(badge.id)))
    .sort((a, b) => positions.get(Number(a.id)) - positions.get(Number(b.id))).slice(0, 6);
}

function responseFor(user, available, explicitIds) {
  const badges = selectedBadges(user, available, explicitIds);
  return {
    enabled: Boolean(user.email_signature_enabled),
    configured: Boolean(user.email_signature_enabled)
      || (Array.isArray(user.email_signature_badge_ids) && user.email_signature_badge_ids.length > 0),
    selected_badge_ids: badges.map((badge) => Number(badge.id)),
    available_badges: available,
    html: getEmailSignature({ user, badges }),
    plain_text: `${user.name}\n${user.email}\nBadges: ${badges.map((badge) => badge.name).join(", ") || "Sem badges"}`,
  };
}

function validBadgeIds(value, available) {
  const availableIds = new Set(available.map((badge) => Number(badge.id)));
  return [...new Set((Array.isArray(value) ? value : []).map(Number))]
    .filter((id) => availableIds.has(id));
}

export async function getMyEmailSignature(req, res) {
  try {
    const user = await User.findByPk(req.userId);
    if (!user) return res.status(404).json({ message: "Utilizador não encontrado" });
    res.json(responseFor(user, await loadAvailableBadges(user)));
  } catch (error) {
    console.error("Erro ao carregar assinatura de email:", error);
    res.status(500).json({ message: "Erro ao carregar assinatura de email" });
  }
}

export async function updateMyEmailSignature(req, res) {
  try {
    const user = await User.findByPk(req.userId);
    if (!user) return res.status(404).json({ message: "Utilizador não encontrado" });
    const available = await loadAvailableBadges(user);
    const requestedIds = validBadgeIds(req.body?.badge_ids, available);
    if (requestedIds.length > 6) return res.status(400).json({ message: "Seleciona no máximo 6 badges" });
    user.email_signature_enabled = req.body?.enabled === true;
    user.email_signature_badge_ids = requestedIds;
    await user.save();
    res.json(responseFor(user, available, requestedIds));
  } catch (error) {
    console.error("Erro ao guardar assinatura de email:", error);
    res.status(500).json({ message: "Erro ao guardar assinatura de email" });
  }
}

export async function previewMyEmailSignature(req, res) {
  try {
    const user = await User.findByPk(req.userId);
    if (!user) return res.status(404).json({ message: "Utilizador não encontrado" });
    const available = await loadAvailableBadges(user);
    const requestedIds = validBadgeIds(req.body?.badge_ids, available);
    if (requestedIds.length > 6) return res.status(400).json({ message: "Seleciona no máximo 6 badges" });
    res.json(responseFor(user, available, requestedIds));
  } catch (error) {
    console.error("Erro ao pré-visualizar assinatura de email:", error);
    res.status(500).json({ message: "Erro ao pré-visualizar assinatura de email" });
  }
}
