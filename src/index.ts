import dotenv from "dotenv";
import express from "express";
import path from "path";
import router from "./routes/index";
import {questions} from "./routes/questions";
// import bodyParser from "body-parser";

// Initialize configuration
dotenv.config();

// Set port from environment variable
const port = process.env.SERVER_PORT;

const app = express();

// Configure Express to use EJS
app.set( "view engine", "ejs" );
app.set( "views", path.join( __dirname, "views/") );

// Set up middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set all routes from routes folder
app.use("/", router);
app.use("/question", questions);

// Set public directory serving static files
app.use("/public", express.static(path.join(__dirname, "public")));

// start the Express server
app.listen( port, () => {
    // tslint:disable-next-line:no-console
    console.log( `server started at http://localhost:${ port }` );
} );
