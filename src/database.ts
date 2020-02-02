// Import .env configuration
import dotenv from "dotenv";
// Import mysql2/promise client
import mysql2 from "mysql2/promise";

// Initialize .env configuration
dotenv.config();

// Create connection pool
const pool = mysql2.createPool({
    connectionLimit: 10,
    database: process.env.DATABASE,
    host: process.env.HOST,
    multipleStatements: true,
    password: process.env.PASSWORD,
    user: process.env.USER,
});

export default pool;
