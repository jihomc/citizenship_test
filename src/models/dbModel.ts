import mysql2 from "mysql2/promise";
import pool from "../database";

class DataModel {
    public static locationMenu = () => {
        return new Promise((resolve, reject) => {
            pool.query("SELECT DISTINCT LOCATION FROM geo", (err: any, rows: any) => {
                if (err) { reject(err); }
                const locationlist = JSON.parse(JSON.stringify(rows));
                resolve(locationlist);
            });
        });
    }
    public static checkZip = (location: any, zip: any) => {
        return new Promise((resolve, reject) => {
            const checkZip = "SELECT EXISTS (SELECT 1 FROM zips WHERE location = (?) AND zip_code = (?))";
            const queryZip = mysql2.format(checkZip, [location, zip]);
            pool.execute(queryZip, (err: any, results: any) => {
                if (err) { reject(err); }
                const validation = Object.values(results[0]);
                resolve(validation[0]);
            });
        });
    }
    public static startZip = (location: any, zip: any) => {
        return new Promise((resolve, reject) => {
        // final query for zips & reps
        // tslint:disable-next-line: max-line-length
            const setDistricts = "SELECT districts into @districts from zips where location = (?) and zip_code = (?)";
            const setVariable = mysql2.format(setDistricts, [location, zip]);
            const queryDistricts = "SELECT @districts";
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

            pool.getConnection()
            .then((conn) => {
                const res = conn.query(setVariable);
                // tslint:disable-next-line: no-console
                // console.log("setVariable: " + res);
                return conn;
                }).then((conn) => {
                    const QA = conn.query(getQA);
                    // tslint:disable-next-line: no-console
                    // console.log("QA query: " + QA);
                    const results = QA;
                    conn.release();
                    resolve(QA);
                }).catch((err) => {
                    reject(err);
            });
        });
    }

    public static startTerritory = (location: any) => {
        return new Promise((resolve, reject) => {
            // final query for territories
            // tslint:disable-next-line: no-console
            console.log("in dbmodel territory: " + location);
            // tslint:disable-next-line: max-line-length
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
            pool.execute(territoryQuery, (err: any, results: any) => {
                if (err) { reject(err); }
                const QA = results;
                resolve(QA);
            });
        });
    }
    public static startDAL = (location: any) => {
        return new Promise((resolve, reject) => {
            // Final query for states with one congressional district - District at Large (DAL)
            // tslint:disable-next-line: max-line-length
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
            pool.execute(DALQuery, (err: any, results: any) => {
                if (err) { reject(err); }
                const QA = results;
                resolve(QA);
            });
        });
    }

                // const conn = await pool.getConnection();
            // try {
            // await conn.query(setVariable, (err: any, results: any) => {
            //     if (err) { throw err; }
            //     // tslint:disable-next-line: no-console
            //     console.log("setVariable executed");
            // });
            // const values = () => {
            //     return new Promise( async (resolve: any, rejected: any) => {
            //         await conn.execute(queryDistricts, (err: any, results: any) => {
            //             if (err) {
            //                 rejected(err);
            //             }
            //             // resolved(JSON.parse(JSON.stringify(results)));
            //             results = JSON.parse(JSON.stringify(results));
            //             // tslint:disable-next-line: no-console
            //             console.log(results);
            //             resolve(results);
            //         });
            //     });
            // };
            //     } catch (err) {
            //         // tslint:disable-next-line: no-console
            //         console.log(err);
            //     } finally {
            //         conn.release();
            //     }
            // }
                // return new Promise((resolved, rejected) => {
                    //     async function multiquery() {
            //         const conn = await getConnection();
            //         try {
            //             await conn.query(setVariable, (err: any, results: any) => {
            //                 if (err) { throw err; }
            //             });
            //             await conn.query(queryDistricts, (err: any, results: any) => {
            //                 if (err) { throw err; }
            //                 resolved(results);
            //             });
            //         } catch (err) {
            //             // tslint:disable-next-line: no-console
            //             console.log(err);
            //         } finally {
            //             conn.release();
            //         }
            //     }
            // });

}
export default DataModel;
