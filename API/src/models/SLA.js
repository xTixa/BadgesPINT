import { DataTypes } from "sequelize";
import database from "../config/database.js";
import User from "./User.js";

const SLA = database.define(
  "SLA",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    team_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "ID da equipa (talent_manager ou service_line_leader user)"
    },

    team_type: {
      type: DataTypes.ENUM("talent_manager", "service_line_leader"),
      allowNull: false
    },

    hours_limit: {
      type: DataTypes.INTEGER,
      defaultValue: 24,
      comment: "Limite de horas para responder a pedidos"
    },

    notification_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },

    email_notification: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },

    push_notification: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },

    status: {
      type: DataTypes.ENUM("active", "inactive"),
      defaultValue: "active"
    }
  },
  {
    tableName: "slas",
    timestamps: true
  }
);

// Associação com User
SLA.belongsTo(User, { foreignKey: "team_id", as: "team" });
User.hasMany(SLA, { foreignKey: "team_id", as: "slas" });

export default SLA;
