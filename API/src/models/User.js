import { DataTypes } from "sequelize";
import database from "../config/database.js";

const User = database.define(
  "User",
  {
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
    points_total: { type: DataTypes.INTEGER, defaultValue: 0 },
    last_login: { type: DataTypes.DATE, allowNull: true },
  },
  { tableName: "users",
    timestamps: true,
    underscored: true}
);

export default User;
