import { DataTypes } from "sequelize";
import database from "../config/database.js";
import Area from "./Area.js";

const Badge = database.define("badges", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  area_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  level: {
    type: DataTypes.ENUM('Junior','Intermedio','Senior','Especialista','Lider'),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  subtitle: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  slug: {
    type: DataTypes.STRING(180),
    allowNull: true,
    unique: true
  },
  learning_outcomes: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  target_audience: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  prerequisites: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  duration_minutes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  difficulty: {
    type: DataTypes.STRING(40),
    allowNull: true
  },
  language: {
    type: DataTypes.STRING(40),
    defaultValue: "pt-PT"
  },
  instructor_name: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  promo_video_url: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  published: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  points: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  expiry_days: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  image_url: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_premium: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  special_deadline: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, { timestamps: false, tableName: "badges" });

Badge.belongsTo(Area, { foreignKey: "area_id", as: "area" });
Area.hasMany(Badge, { foreignKey: "area_id", as: "badges" });

export default Badge;
