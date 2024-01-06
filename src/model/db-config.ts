import { Sequelize } from 'sequelize-typescript';
import * as dotenv from 'dotenv'

dotenv.config({ path: __dirname + "/../../.env.local" });
dotenv.config({ path: __dirname + "/../../.env" });

const DB_NAME = process.env.DB_NAME || "";
const DB_USER = process.env.DB_USER || "";
const DB_PASS = process.env.DB_PASS || "";
const DB_HOST = process.env.DB_HOST || "";


export const sequelize = new Sequelize({
  database: DB_NAME,
  dialect: 'mysql',
  username:DB_USER,
  password: DB_PASS,
  port: 3306
});
