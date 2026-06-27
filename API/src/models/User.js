import { DataTypes } from "sequelize";
import database from "../config/database.js";

const User = database.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING, allowNull: false },
    role: {
      type: DataTypes.ENUM(
        "admin",
        "talent_manager",
        "service_line_leader",
        "consultant"
      ),
      allowNull: false,
    },
    area_id: { type: DataTypes.INTEGER, allowNull: true },
    avatar_url: { type: DataTypes.TEXT, allowNull: true },
    rgpd_publication_accepted: { type: DataTypes.BOOLEAN, defaultValue: false },
    public_profile_enabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    linkedin_sharing_enabled: { type: DataTypes.BOOLEAN, defaultValue: true },
    email_signature_enabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    email_signature_badge_ids: { type: DataTypes.JSONB, allowNull: true },
    goal_text: { type: DataTypes.TEXT, allowNull: true },
    goal_deadline: { type: DataTypes.DATEONLY, allowNull: true },
    points_total: { type: DataTypes.INTEGER, defaultValue: 0 },
    last_login: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: "Users",
    timestamps: true,
    underscored: true,
  }
);

export default User;
