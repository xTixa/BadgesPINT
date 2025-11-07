import { DataTypes } from "sequelize";
import database from "../config/database.js";

const LearningPath = database.define("learning_paths", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
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
});

export default LearningPath;
