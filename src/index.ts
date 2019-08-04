import dotenv from "dotenv";
import express from "express";
// import mysql from "mysql";
import path from "path";
import connection from "./database";
// import * as routes from "./routes";
import router from "./routes";
// import bodyParser from "body-parser";

// initialize configuration
dotenv.config();

// port is now available to the Node.js runtime
// as if it were an environment variable
const port = process.env.SERVER_PORT;

const app = express();

// Establish connection to mysql db "citizen"
// const connection = mysql.createConnection({
//     database: "citizen",
//     host: "localhost",
//     password: "bar",
//     user: "foo"
// });

// connect((err) => {
//     if (err) { throw err; }
// });

// export const conn = connect();

// connect.connect() (err) => {
//     if (err) {
//         // tslint:disable-next-line: no-console
//         console.error("error connecting: " + err.stack);
//         return;
//     }
//     // console.log('connected as id ' + connection.threadId);
// });

// Configure Express to use EJS
app.set( "views", path.join( __dirname, "views") );
app.set( "view engine", "ejs" );

// Set up middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set all routes from routes folder
app.use("/", router);

// Set public directory serving static files
app.use("/public", express.static(path.join(__dirname, "public")));
// app.use("/public", express.static(__dirname + "/public"));

// Configure routes
// routes.register( app );

// start the Express server
app.listen( port, () => {
    // tslint:disable-next-line:no-console
    console.log( `server started at http://localhost:${ port }` );
} );
