import { DataTypes } from "sequelize";
import database from "../config/database.js";
import Badge from "./Badge.js";

const Requirement = database.define("requirements", {
id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
},
badge_id: {
    type: DataTypes.UUID,
    allowNull: false
},
code: {
    type: DataTypes.STRING(10),
    allowNull: false
},
description: {
    type: DataTypes.TEXT,
    allowNull: false
}
}, { timestamps: false,
    tableName: "requirements" });

Requirement.belongsTo(Badge, { foreignKey: "badge_id", as: "badge" });
Badge.hasMany(Requirement, { foreignKey: "badge_id", as: "requirements" });

export default Requirement;
