// Import .env configuration
import dotenv from "dotenv";
// Import mysql2/promise client
import mysql2 from "mysql2/promise";

// Initialize .env configuration
dotenv.config();

// Create connection pool
const pool = mysql2.createPool({
    connectionLimit: 10,
    database: process.env.MYSQL_DATABASE,
    host: process.env.MYSQL_HOSTNAME,
    multipleStatements: true,
    password: process.env.MYSQL_PASSWORD,
    user: process.env.MYSQL_USERNAME,
});

export default pool;
