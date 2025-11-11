import { DataTypes } from "sequelize";
import database from "../config/database.js";

const LearningPath = database.define("learning_paths", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
}, {
  timestamps: false,
  tableName: "learning_paths"
});

export default LearningPath;
