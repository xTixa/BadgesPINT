import { DataTypes } from "sequelize";
import database from "../config/database.js";
import User from "./User.js";

const Ticket = database.define(
  "Ticket",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    titulo: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [3, 255],
      },
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [10, 5000],
      },
    },
    categoria: {
      type: DataTypes.ENUM("bug", "feature", "duvida", "outro"),
      defaultValue: "outro",
    },
    status: {
      type: DataTypes.ENUM("aberto", "em_analise", "resolvido", "fechado"),
      defaultValue: "aberto",
    },
    prioridade: {
      type: DataTypes.ENUM("baixa", "media", "alta", "critica"),
      defaultValue: "media",
    },
    utilizador_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    admin_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Users",
        key: "id",
      },
    },
    resposta_admin: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    data_resolucao: {
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
    tableName: "Tickets",
    timestamps: true,
  }
);

export default Ticket;
