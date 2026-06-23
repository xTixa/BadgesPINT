import Notification from "../models/Notification.js";

export async function createNotification({
  utilizador_id,
  titulo,
  mensagem,
  tipo = "geral",
  ticket_id = null,
  transaction = null,
  push = true,
  email = null,
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
