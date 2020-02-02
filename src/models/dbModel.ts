import mysql2 from "mysql2/promise";
import pool from "../database";

class DataModel {

    // Retrieve locations from database for dropdown menu select
    public static locationMenu = () => {
        return new Promise((resolve, reject) => {

            // Query the database for location data
            pool.query("SELECT DISTINCT LOCATION FROM geo", (err: any, rows: any) => {

                if (err) { reject(err); }
                const locationlist = JSON.parse(JSON.stringify(rows));

                // Return locationlist for rendering
                resolve(locationlist);

            });
        });
    }

    // Validate zip code against database and return validation result
    public static checkZip = (location: any, zip: any) => {
        return new Promise((resolve, reject) => {

            // Format the query as a prepared statement
            const checkZip = "SELECT EXISTS (SELECT 1 FROM zips WHERE location = (?) AND zip_code = (?))";
            const queryZip = mysql2.format(checkZip, [location, zip]);

            // Execute the query to check zip code
            pool.execute(queryZip, (err: any, results: any) => {

                if (err) { reject(err); }
                const validation = Object.values(results[0]);

                // Return validation result
                resolve(validation[0]);

            });
        });
    }

    // Retrieve questions and answers based on user location and zip code
    public static startZip = (location: any, zip: any) => {
        return new Promise((resolve, reject) => {

            // Build and format first query
            const setDistricts = "SELECT districts into @districts from zips where location = (?) and zip_code = (?)";
            const setVariable = mysql2.format(setDistricts, [location, zip]);

            // Build and format second query
            const queryQA = "select questions.question_id, questions.question, questions.answer from \
            questions where not exists (select question_id from geo where geo.question_id = questions.question_id) \
            AND NOT EXISTS (select question_id from reps where reps.question_id = questions.question_id) \
            UNION SELECT questions.question_id, questions.question, geo.answer FROM questions \
            JOIN geo on questions.question_id = geo.question_id where geo.location = (?) \
            UNION SELECT questions.question_id, questions.question, \
            CONCAT('[', GROUP_CONCAT(CONCAT('\"', reps.representative, '\"') SEPARATOR ', '), ']') \
            as answer FROM questions JOIN reps on questions.question_id = reps.question_id where district in \
            (select * from JSON_TABLE(@districts, '$[*]' COLUMNS(value int path '$'))data) and location = (?)";
            const getQA = mysql2.format(queryQA, [location, location]);

            // Open connection from pool and execute the two queries
            pool.getConnection()
            .then((conn) => {

                // The setVariable query creates the @districts variable used for the next query
                const res = conn.query(setVariable);
                return conn;
                }).then((conn) => {

                    // getQA query builds the appropriate questions and answers list
                    const QA = conn.query(getQA);
                    // Release the connection back to the pool
                    conn.release();
                    // Resolve question and answer list for location and zip to homeController.start
                    resolve(QA);

                }).catch((err) => {
                    reject(err);
            });
        });
    }

    // Retrieve questions and answers based on territory location
    public static startTerritory = (location: any) => {
        return new Promise((resolve, reject) => {

            // Build and format query as prepared statement
            const query = "select questions.question_id, questions.question, questions.answer \
            FROM questions where not exists \
            (select question_id from geo where geo.question_id = questions.question_id) \
            AND NOT EXISTS (select question_id from reps where reps.question_id = questions.question_id) \
            UNION SELECT questions.question_id, questions.question, geo.answer FROM questions \
            JOIN geo on questions.question_id = geo.question_id where geo.location = (?) \
            UNION SELECT questions.question_id, questions.question, \
            CONCAT('[', CONCAT('\"', reps.representative, '\"'), ', \"',\
            (?), ' has no (voting) Representatives in Congress\"', ']') \
            AS answer FROM questions JOIN reps ON questions.question_id = reps.question_id \
            WHERE district = 0 AND location = (?)";
            const territoryQuery = mysql2.format(query, [location, location, location]);

            // Execute the query to build the question and answer list
            pool.execute(territoryQuery, (err: any, results: any) => {

                if (err) { reject(err); }
                const QA = results;
                // Resolve question and answer list for homeController.start
                resolve(QA);

            });
        });
    }

    // Retrive questions and answers for states with one congressional district, aka District at Large (DAL)
    public static startDAL = (location: any) => {
        return new Promise((resolve, reject) => {

            // Build and format query as prepared statement
            const query = "select questions.question_id, questions.question, questions.answer \
            FROM questions where not exists \
            (select question_id from geo where geo.question_id = questions.question_id) \
            AND NOT EXISTS (select question_id from reps where reps.question_id = questions.question_id) \
            UNION SELECT questions.question_id, questions.question, geo.answer FROM questions \
            JOIN geo on questions.question_id = geo.question_id where geo.location = (?) \
            UNION SELECT questions.question_id, questions.question, \
            CONCAT('[', CONCAT('\"', reps.representative, '\"'), ']') \
            AS answer FROM questions JOIN reps ON questions.question_id = reps.question_id \
            WHERE district = 0 AND location = (?)";
            const DALQuery = mysql2.format(query, [location, location]);

            // Execute the query to build the question and answer list
            pool.execute(DALQuery, (err: any, results: any) => {

                if (err) { reject(err); }
                const QA = results;
                // Resolve question and answer list for homeController.start
                resolve(QA);

            });
        });
    }

}

export default DataModel;
