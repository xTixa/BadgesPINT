import { DataTypes } from "sequelize";
import database from "../config/database.js";
import ServiceLine from "./ServiceLine.js";

const Area = database.define("areas", {
id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
},
service_line_id: {
    type: DataTypes.UUID,
    allowNull: false
},
name: {
    type: DataTypes.STRING(150),
    allowNull: false

},
parent_id: {
    type: DataTypes.UUID,
    allowNull: true

}
}, { timestamps: false, tableName: "areas" });

Area.belongsTo(ServiceLine, { foreignKey: "service_line_id", as: "serviceLine" });
ServiceLine.hasMany(Area, { foreignKey: "service_line_id", as: "areas" });

// referencia a si mesma para áreas pai e subáreas
Area.hasMany(Area, { foreignKey: "parent_id", as: "subareas" });
Area.belongsTo(Area, { foreignKey: "parent_id", as: "parent" });

export default Area;
