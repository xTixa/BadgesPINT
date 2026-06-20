import { DataTypes } from "sequelize";
import database from "../config/database.js";
import Badge from "./Badge.js";
import BadgeSection from "./BadgeSection.js";

const BadgeLesson = database.define(
  "badge_lessons",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    badge_id: { type: DataTypes.INTEGER, allowNull: false },
    section_id: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING(180), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    content_type: {
      type: DataTypes.ENUM("video", "article", "exercise", "quiz", "external"),
      defaultValue: "article",
    },
    content_url: { type: DataTypes.TEXT, allowNull: true },
    duration_minutes: { type: DataTypes.INTEGER, defaultValue: 0 },
    is_preview: { type: DataTypes.BOOLEAN, defaultValue: false },
    position: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  {
    tableName: "badge_lessons",
    timestamps: true,
    underscored: true,
  }
);

BadgeLesson.belongsTo(Badge, { foreignKey: "badge_id", as: "badge" });
BadgeLesson.belongsTo(BadgeSection, { foreignKey: "section_id", as: "section" });
Badge.hasMany(BadgeLesson, { foreignKey: "badge_id", as: "lessons" });
BadgeSection.hasMany(BadgeLesson, { foreignKey: "section_id", as: "lessons" });

export default BadgeLesson;
