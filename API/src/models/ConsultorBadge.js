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
