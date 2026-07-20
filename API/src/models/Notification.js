import { DataTypes } from "sequelize";
import database from "../config/database.js";
import User from "./User.js";
import { sendPushToUser, sendPushToUsers } from "../services/firebaseService.js";

const Notification = database.define(
  "Notification",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    tipo: {
      type: DataTypes.ENUM("ticket_novo", "ticket_resposta", "ticket_resolvido", "ticket_fechado", "geral", "sla"),
      allowNull: false,
    },
    titulo: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    mensagem: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    utilizador_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    ticket_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Tickets",
        key: "id",
      },
    },
    lido: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    data_leitura: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "Notifications",
    timestamps: true,
  }
);

Notification.afterCreate(async (notification, options) => {
  if (options?.skipPush) return;

  try {
    await sendPushToUser(notification.utilizador_id, notification);
  } catch (error) {
    console.error("Erro ao enviar push Firebase:", error.message);
  }
});

Notification.afterBulkCreate(async (notifications, options) => {
  if (options?.skipPush) return;

  const eligibleIds = options?.pushEligibleUserIds;
  const targetIds = eligibleIds
    ? notifications.map((n) => n.utilizador_id).filter((id) => eligibleIds.has(id))
    : notifications.map((n) => n.utilizador_id);

  if (targetIds.length === 0) return;

  try {
    await sendPushToUsers(
      targetIds,
      {
        id: notifications[0]?.id ?? "",
        tipo: notifications[0]?.tipo ?? "geral",
        titulo: notifications[0]?.titulo ?? "Softinsa Badges",
        mensagem: notifications[0]?.mensagem ?? "",
      }
    );
  } catch (error) {
    console.error("Erro ao enviar push Firebase em lote:", error.message);
  }
});

export default Notification;
