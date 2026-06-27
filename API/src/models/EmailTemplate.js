import { DataTypes } from "sequelize";
import database from "../config/database.js";

const EmailTemplate = database.define("EmailTemplate", {
  key: { type: DataTypes.STRING(80), primaryKey: true },
  subject: { type: DataTypes.STRING(240), allowNull: false },
  html_body: { type: DataTypes.TEXT, allowNull: false },
  text_body: { type: DataTypes.TEXT, allowNull: true },
  enabled: { type: DataTypes.BOOLEAN, defaultValue: true },
  updated_by: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: "email_templates",
  timestamps: true,
  underscored: true,
});

export default EmailTemplate;
