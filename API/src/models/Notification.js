import { DataTypes } from "sequelize";
import database from "../config/database.js";
import User from "./User.js";

const Notification = database.define(
  "Notification",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    tipo: {
      type: DataTypes.ENUM("ticket_novo", "ticket_resposta", "ticket_resolvido", "ticket_fechado", "geral"),
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

export default Notification;
