import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const database = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

export default database;
