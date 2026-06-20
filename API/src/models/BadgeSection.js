import { DataTypes } from "sequelize";
import database from "../config/database.js";
import Badge from "./Badge.js";

const BadgeSection = database.define(
  "badge_sections",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    badge_id: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING(180), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    position: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  {
    tableName: "badge_sections",
    timestamps: true,
    underscored: true,
  }
);

BadgeSection.belongsTo(Badge, { foreignKey: "badge_id", as: "badge" });
Badge.hasMany(BadgeSection, { foreignKey: "badge_id", as: "sections" });

export default BadgeSection;
