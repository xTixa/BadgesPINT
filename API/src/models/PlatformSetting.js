import { DataTypes } from "sequelize";
import database from "../config/database.js";

// Linha única (id fixo = 1) com as definições globais configuráveis pelo
// Admin em /admin/configuracoes.
const PlatformSetting = database.define(
  "PlatformSetting",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, defaultValue: 1 },
    points_per_badge: { type: DataTypes.INTEGER, defaultValue: 100 },
    badges_can_expire: { type: DataTypes.BOOLEAN, defaultValue: false },
    default_sla_days: { type: DataTypes.INTEGER, defaultValue: 7 },
    notify_email: { type: DataTypes.BOOLEAN, defaultValue: true },
    notify_push: { type: DataTypes.BOOLEAN, defaultValue: false },
    notify_teams: { type: DataTypes.BOOLEAN, defaultValue: false },
    rgpd_consent_text: { type: DataTypes.TEXT, allowNull: true },
    public_gallery_enabled: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  {
    tableName: "platform_settings",
    timestamps: true,
    underscored: true,
  }
);

export default PlatformSetting;
