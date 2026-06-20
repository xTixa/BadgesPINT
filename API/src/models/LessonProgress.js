import { DataTypes } from "sequelize";
import database from "../config/database.js";
import Badge from "./Badge.js";
import BadgeLesson from "./BadgeLesson.js";
import User from "./User.js";

const LessonProgress = database.define(
  "lesson_progress",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    consultor_id: { type: DataTypes.INTEGER, allowNull: false },
    badge_id: { type: DataTypes.INTEGER, allowNull: false },
    lesson_id: { type: DataTypes.INTEGER, allowNull: false },
    completed: { type: DataTypes.BOOLEAN, defaultValue: false },
    completed_at: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: "lesson_progress",
    timestamps: true,
    underscored: true,
    indexes: [{ unique: true, fields: ["consultor_id", "lesson_id"] }],
  }
);

LessonProgress.belongsTo(User, { foreignKey: "consultor_id", as: "consultor" });
LessonProgress.belongsTo(Badge, { foreignKey: "badge_id", as: "badge" });
LessonProgress.belongsTo(BadgeLesson, { foreignKey: "lesson_id", as: "lesson" });
User.hasMany(LessonProgress, { foreignKey: "consultor_id", as: "lessonProgress" });
BadgeLesson.hasMany(LessonProgress, { foreignKey: "lesson_id", as: "progress" });

export default LessonProgress;
