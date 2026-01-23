import { DataTypes } from "sequelize";
import database from "../config/database.js";

const AuditLog = database.define(
  "AuditLog",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Users",
        key: "id",
      },
      allowNull: true,
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Tipo de ação (CREATE, UPDATE, DELETE, LOGIN, etc.)",
    },
    entity: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Entidade afetada (User, Badge, LearningPath, etc.)",
    },
    entityId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "ID da entidade afetada",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Descrição detalhada da ação",
    },
    oldValues: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Valores anteriores (para updates)",
    },
    newValues: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Novos valores (para updates)",
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("success", "failure", "warning"),
      defaultValue: "success",
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
    tableName: "AuditLogs",
  }
);

export default AuditLog;
