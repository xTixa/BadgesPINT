import { DataTypes } from "sequelize";
import database from "../config/database.js";

const RequirementEvidence = database.define(
  "requirement_evidences",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    consultor_id: { type: DataTypes.INTEGER, allowNull: false },
    requirement_id: { type: DataTypes.INTEGER, allowNull: false },
    badge_id: { type: DataTypes.INTEGER, allowNull: false },
    status: {
      type: DataTypes.ENUM("pendente", "aprovado", "rejeitado"),
      defaultValue: "pendente"
    },
    evidence_url: { type: DataTypes.TEXT, allowNull: false },
    notes: { type: DataTypes.TEXT, allowNull: true }
  },
  {
    tableName: "requirement_evidences",
    timestamps: true,
    underscored: true
  }
);

export default RequirementEvidence;
