import { DataTypes } from "sequelize";
import database from "../config/database.js";
import User from "./User.js";

const FcmToken = database.define(
  "FcmToken",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    utilizador_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    token: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
    platform: {
      type: DataTypes.STRING(40),
      allowNull: true,
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    ultimo_uso: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "FcmTokens",
    timestamps: true,
  }
);

FcmToken.belongsTo(User, { foreignKey: "utilizador_id", as: "user" });
User.hasMany(FcmToken, { foreignKey: "utilizador_id", as: "fcmTokens" });

export default FcmToken;
