// import { createPool, Pool } from "mysql";
// import mysql from "mysql";
// import mysql2 from "mysql2";
import mysql2 from "mysql2/promise";

// export async function connection(): Promise<Pool> {
//     const connect = await mysql2.createPool({
//         connectionLimit: 10,
//         database: process.env.DATABASE || "citizen",
//         host: process.env.HOST || "localhost",
//         password: process.env.PASSWORD || "bar",
//         user: process.env.USER || "foo"
//     });
//     return connect;

// const connection = mysql2.createConnection({
//     database: process.env.DATABASE || "citizen",
//     host: process.env.HOST || "localhost",
//     password: process.env.PASSWORD || "bar",
//     user: process.env.USER || "foo"
// });

// connection.connect();

const pool = mysql2.createPool({
    connectionLimit: 10,
    database: process.env.DATABASE || "citizen",
    host: process.env.HOST || "localhost",
    multipleStatements: true,
    password: process.env.PASSWORD || "bar",
    user: process.env.USER || "foo",
});

// const getConnection = () => pool.getConnection();
// export { getConnection };

// pool.on("connection", (connection) => {
//     connection.query("SET SESSION auto_increment_increment=1");
//   });

// export default connection;
export default pool;
