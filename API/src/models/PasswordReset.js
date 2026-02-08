import { DataTypes } from "sequelize";
import database from "../config/database.js";

const PasswordReset = database.define(
  "PasswordReset",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    token_hash: { type: DataTypes.STRING, allowNull: false },
    expires_at: { type: DataTypes.DATE, allowNull: false },
    used_at: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: "PasswordResets",
    timestamps: true,
    underscored: true,
  }
);

export default PasswordReset;
