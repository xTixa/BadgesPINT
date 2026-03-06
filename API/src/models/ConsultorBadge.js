import { DataTypes } from "sequelize";
import database from "../config/database.js";

const ConsultorBadge = database.define(
  "ConsultorBadge",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    consultor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    badge_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM("obtido", "pendente", "rejeitado"),
      defaultValue: "pendente",
    },

    workflow_status: {
      type: DataTypes.STRING(20),
      defaultValue: "open",
    },

    submitted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    tm_validator_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    tm_validated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    tm_comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    sl_validator_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    sl_validated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    sl_comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    data_atribuicao: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "consultor_badges",
    timestamps: false,
  }
);

export default ConsultorBadge;
