import sequelize from "./src/config/database.js";
import { DataTypes } from "sequelize";

export const User = sequelize.define("users", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: { type: DataTypes.STRING(150), allowNull: false },
  email: { type: DataTypes.STRING(255), unique: true, allowNull: false },
  password_hash: { type: DataTypes.TEXT, allowNull: false },
  role: {
    type: DataTypes.ENUM("admin", "consultant", "talent_manager", "service_line_leader"),
    defaultValue: "consultant"
  },
  points_total: { type: DataTypes.INTEGER, defaultValue: 0 }
}, {
  timestamps: false
});

export default sequelize;
