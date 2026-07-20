import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { sendPushToUser } from "./firebaseService.js";
import { sendTeamsWebhook, sendTeamsWebhookToUrls } from "./teamsWebhookService.js";
import { getTeamWebhooksForBadge } from "./teamWebhookLookup.js";
import { categoriaFromTipo, getChannelsForCategory } from "./notificationPreferences.js";

export async function sendPushNotification({ utilizador_id, titulo, mensagem, tipo = "geral", data = {} }) {
  return sendPushToUser(utilizador_id, {
    id: data.notificationId || "",
    tipo,
    titulo,
    mensagem,
    ...data,
  });
}

export async function getEffectiveChannels(utilizador_id, categoria) {
  const user = await User.findByPk(utilizador_id, { attributes: ["notification_preferences"] });
  return getChannelsForCategory(user?.notification_preferences, categoria);
}

export async function createNotification({
  utilizador_id,
  titulo,
  mensagem,
  tipo = "geral",
  categoria = null,
  ticket_id = null,
  transaction = null,
  push = true,
  email = null,
  teamsNotify = false,
  teamsBadgeId = null,
}) {
  const resolvedCategoria = categoria || categoriaFromTipo(tipo);
  const channels = await getEffectiveChannels(utilizador_id, resolvedCategoria);

  const notification = await Notification.create(
    {
      tipo,
      titulo,
      mensagem,
      utilizador_id,
      ticket_id,
      lido: false,
      ativo: channels.inApp,
    },
    {
      ...(transaction ? { transaction } : {}),
      skipPush: !push || !channels.push,
    }
  );

  if (channels.email && email?.send && email?.to) {
    email
      .send()
      .catch((error) =>
        console.error(`Email associado a notificacao ${notification.id} falhou:`, error.message)
      );
  }

  if (teamsNotify) {
    sendTeamsWebhook({ titulo, mensagem }).catch((error) =>
      console.error(`Webhook Teams/Slack associado a notificacao ${notification.id} falhou:`, error.message)
    );

    if (teamsBadgeId) {
      getTeamWebhooksForBadge(teamsBadgeId)
        .then((urls) => sendTeamsWebhookToUrls(urls, { titulo, mensagem }))
        .catch((error) =>
          console.error(`Webhooks Teams de equipa para notificacao ${notification.id} falharam:`, error.message)
        );
    }
  }

  return notification;
}

export async function createUniqueNotification({
  utilizador_id,
  titulo,
  mensagem,
  tipo = "geral",
  categoria = null,
  ticket_id = null,
  email = null,
  push = true,
  teamsNotify = false,
  teamsBadgeId = null,
}) {
  const existing = await Notification.findOne({
    where: {
      utilizador_id,
      titulo,
      mensagem,
      tipo,
    },
  });

  if (existing) {
    existing.setDataValue("_existing", true);
    return existing;
  }

  const notification = await createNotification({
    utilizador_id,
    titulo,
    mensagem,
    tipo,
    categoria,
    ticket_id,
    email,
    push,
    teamsNotify,
    teamsBadgeId,
  });
  notification.setDataValue("_existing", false);
  return notification;
}

export async function createNotifications(items, { push = true, transaction = null, categoria = null } = {}) {
  if (!items.length) return [];

  const channelsByUser = new Map();
  await Promise.all(
    [...new Set(items.map((item) => item.utilizador_id))].map(async (utilizador_id) => {
      const resolvedCategoria = categoria || categoriaFromTipo(items.find((i) => i.utilizador_id === utilizador_id)?.tipo);
      channelsByUser.set(utilizador_id, await getEffectiveChannels(utilizador_id, resolvedCategoria));
    })
  );

  const pushEligibleUserIds = new Set(
    [...channelsByUser.entries()].filter(([, channels]) => channels.push).map(([id]) => id)
  );

  return Notification.bulkCreate(
    items.map((item) => ({
      tipo: item.tipo || "geral",
      titulo: item.titulo,
      mensagem: item.mensagem,
      utilizador_id: item.utilizador_id,
      ticket_id: item.ticket_id || null,
      lido: false,
      ativo: channelsByUser.get(item.utilizador_id)?.inApp !== false,
    })),
    {
      ...(transaction ? { transaction } : {}),
      skipPush: !push,
      pushEligibleUserIds,
    }
  );
}
