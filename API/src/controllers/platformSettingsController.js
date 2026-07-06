import PlatformSetting from "../models/PlatformSetting.js";
import { createAuditLog } from "./auditLogController.js";

async function getOrCreateSettings() {
  const [settings] = await PlatformSetting.findOrCreate({ where: { id: 1 } });
  return settings;
}

export async function getPlatformSettings(req, res) {
  try {
    const settings = await getOrCreateSettings();
    res.json(settings);
  } catch (err) {
    console.error("Erro ao obter definições da plataforma:", err);
    res.status(500).json({ message: "Erro ao obter definições da plataforma" });
  }
}

export async function updatePlatformSettings(req, res) {
  try {
    const settings = await getOrCreateSettings();
    const oldValues = settings.toJSON();

    const {
      points_per_badge,
      badges_can_expire,
      default_sla_days,
      notify_email,
      notify_push,
      notify_teams,
      rgpd_consent_text,
      public_gallery_enabled,
    } = req.body;

    if (points_per_badge !== undefined) settings.points_per_badge = Number(points_per_badge) || 0;
    if (badges_can_expire !== undefined) settings.badges_can_expire = badges_can_expire === true;
    if (default_sla_days !== undefined) settings.default_sla_days = Number(default_sla_days) || 0;
    if (notify_email !== undefined) settings.notify_email = notify_email === true;
    if (notify_push !== undefined) settings.notify_push = notify_push === true;
    if (notify_teams !== undefined) settings.notify_teams = notify_teams === true;
    if (rgpd_consent_text !== undefined) settings.rgpd_consent_text = rgpd_consent_text || null;
    if (public_gallery_enabled !== undefined) settings.public_gallery_enabled = public_gallery_enabled === true;

    await settings.save();

    await createAuditLog(req, res, {
      action: "ATUALIZAR_DEFINICOES_PLATAFORMA",
      entity: "PlatformSetting",
      userId: req.userId,
      entityId: settings.id,
      description: "Definições globais da plataforma atualizadas",
      oldValues,
      newValues: settings.toJSON(),
    });

    res.json(settings);
  } catch (err) {
    console.error("Erro ao atualizar definições da plataforma:", err);
    res.status(500).json({ message: "Erro ao atualizar definições da plataforma" });
  }
}
