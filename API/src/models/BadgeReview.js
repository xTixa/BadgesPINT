import { DataTypes } from "sequelize";
import database from "../config/database.js";
import Badge from "./Badge.js";
import User from "./User.js";

const BadgeReview = database.define(
  "badge_reviews",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    badge_id: { type: DataTypes.INTEGER, allowNull: false },
    consultor_id: { type: DataTypes.INTEGER, allowNull: false },
    rating: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING(160), allowNull: true },
    comment: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    tableName: "badge_reviews",
    timestamps: true,
    underscored: true,
    indexes: [{ unique: true, fields: ["badge_id", "consultor_id"] }],
  }
);

BadgeReview.belongsTo(Badge, { foreignKey: "badge_id", as: "badge" });
BadgeReview.belongsTo(User, { foreignKey: "consultor_id", as: "consultor" });
Badge.hasMany(BadgeReview, { foreignKey: "badge_id", as: "reviews" });
User.hasMany(BadgeReview, { foreignKey: "consultor_id", as: "badgeReviews" });

export default BadgeReview;
