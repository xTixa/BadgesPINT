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
  }
}, { timestamps: false, tableName: "badges" });

Badge.belongsTo(Area, { foreignKey: "area_id", as: "area" });
Area.hasMany(Badge, { foreignKey: "area_id", as: "badges" });

export default Badge;