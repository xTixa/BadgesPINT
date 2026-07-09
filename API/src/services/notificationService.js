import Notification from "../models/Notification.js";
import { sendPushToUser } from "./firebaseService.js";
import { sendTeamsWebhook, sendTeamsWebhookToUrls } from "./teamsWebhookService.js";
import { getTeamWebhooksForBadge } from "./teamWebhookLookup.js";

export async function sendPushNotification({ utilizador_id, titulo, mensagem, tipo = "geral", data = {} }) {
  return sendPushToUser(utilizador_id, {
    id: data.notificationId || "",
    tipo,
    titulo,
    mensagem,
    ...data,
  });
}

export async function createNotification({
  utilizador_id,
  titulo,
  mensagem,
  tipo = "geral",
  ticket_id = null,
  transaction = null,
  push = true,
  email = null,
  teamsNotify = false,
  teamsBadgeId = null,
}) {
  const notification = await Notification.create(
    {
      tipo,
      titulo,
      mensagem,
      utilizador_id,
      ticket_id,
      lido: false,
    },
    {
      ...(transaction ? { transaction } : {}),
      skipPush: !push,
    }
  );

  if (email?.send && email?.to) {
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
    ticket_id,
    email,
    push,
    teamsNotify,
    teamsBadgeId,
  });
  notification.setDataValue("_existing", false);
  return notification;
}

export async function createNotifications(items, { push = true, transaction = null } = {}) {
  if (!items.length) return [];

  return Notification.bulkCreate(
    items.map((item) => ({
      tipo: item.tipo || "geral",
      titulo: item.titulo,
      mensagem: item.mensagem,
      utilizador_id: item.utilizador_id,
      ticket_id: item.ticket_id || null,
      lido: false,
    })),
    {
      ...(transaction ? { transaction } : {}),
      skipPush: !push,
    }
  );
}
