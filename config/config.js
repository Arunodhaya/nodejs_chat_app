const dotenv = require("dotenv")

dotenv.config({ path: __dirname + "/../.env.local" });
dotenv.config({ path: __dirname + "/../.env" });
dotenv.config();

const DB_NAME = process.env.DB_NAME || "";
const DB_USER = process.env.DB_USER || "";
const DB_PASS = process.env.DB_PASS || "";
const DB_HOST = process.env.DB_HOST || "";


module.exports = {
  host: DB_HOST,
  username: DB_USER,
  password: DB_PASS,
  port: 3306,
  database: DB_NAME,
  dialect: "mysql",
  dialectOptions: {
    bigNumberStrings: true,
  },
  pool: { maxConnections: 10, maxIdleTime: 30 },
};