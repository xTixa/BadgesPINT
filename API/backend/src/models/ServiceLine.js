import { DataTypes } from "sequelize";
import database from "../config/database.js";
import LearningPath from "./LearningPath.js";

const ServiceLine = database.define("service_lines", {
id: { 
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
},
learning_path_id: {
    type: DataTypes.UUID,
    allowNull: false
},
name: {
    type: DataTypes.STRING(150),
    allowNull: false
},
description: {
    type: DataTypes.TEXT
}
}, { timestamps: false, tableName: "service_lines" });

ServiceLine.belongsTo(LearningPath, { foreignKey: "learning_path_id", as: "learningPath" });
LearningPath.hasMany(ServiceLine, { foreignKey: "learning_path_id", as: "serviceLines" });

export default ServiceLine;
