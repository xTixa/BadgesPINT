import { DataTypes } from "sequelize";
import database from "../config/database.js";
import Badge from "./Badge.js";

const Requirement = database.define("requirements", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  badge_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  code: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  image_url: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, { 
  timestamps: false,
  tableName: "requirements" 
});

Requirement.belongsTo(Badge, { foreignKey: "badge_id", as: "badge" });
Badge.hasMany(Requirement, { foreignKey: "badge_id", as: "requirements" });

export default Requirement;
