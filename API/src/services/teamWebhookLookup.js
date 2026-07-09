import database from "../config/database.js";
import Badge from "../models/Badge.js";
import Area from "../models/Area.js";
import { QueryTypes } from "sequelize";

// Descobre os webhooks Teams configurados pelos Service Line Leaders e
// Talent Managers responsáveis pela área do badge (via sl_preferences /
// tm_preferences), para complementar o webhook global do Admin com os
// canais de equipa que cada gestor escolher.
export async function getTeamWebhooksForBadge(badgeId) {
  const badge = await Badge.findByPk(badgeId, {
    include: [{ model: Area, as: "area", attributes: ["id", "service_line_id"] }],
    attributes: ["id", "area_id"],
  });

  if (!badge?.area?.service_line_id) return [];

  const rows = await database.query(
    `SELECT sl_preferences, tm_preferences FROM "Users" u
     JOIN areas a ON a.id = u.area_id
     WHERE u.role IN ('service_line_leader', 'talent_manager')
       AND a.service_line_id = :slId`,
    { replacements: { slId: badge.area.service_line_id }, type: QueryTypes.SELECT }
  );

  return rows
    .map((row) => row.sl_preferences?.teams_webhook_url || row.tm_preferences?.teams_webhook_url)
    .filter(Boolean);
}
