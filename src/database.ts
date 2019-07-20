// import { createPool, Pool } from "mysql";
import mysql from "mysql";

// export async function connect(): Promise<Pool> {
//     const connection = await createPool({
//         connectionLimit: 10,
//         database: process.env.DATABASE || "citizen",
//         host: process.env.HOST || "localhost",
//         password: process.env.PASSWORD || "bar",
//         user: process.env.USER || "foo"
//     });
//     return connection;
// }

const connection = mysql.createConnection({
    database: process.env.DATABASE || "citizen",
    host: process.env.HOST || "localhost",
    password: process.env.PASSWORD || "bar",
    user: process.env.USER || "foo"
});

connection.connect();

export default connection;
