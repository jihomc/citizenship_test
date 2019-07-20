// import bodyParser from "body-parser";
import { Request, Response } from "express";
// import { connect } from "../database";
// import express from "express";
import connection from "../database";

class HomeController {

    public static home = async (req: Request, res: Response): Promise<Response | void> => {
        try {
            // const conn = await connect();
            await connection.query("SELECT DISTINCT LOCATION FROM geo", (err, rows) => {
                if (err) { throw err; }
                const locationlist = JSON.parse(JSON.stringify(rows));
                // tslint:disable-next-line: no-console
                // console.log(answerlist);
                res.render("index", { locationVals: locationlist, zipVal: " 94108 " });
            });
        } catch (err) {
            throw (err);
            }
    }

    public static setLocation = async (req: Request, res: Response): Promise<Request | void> => {
        try {
            const location = req.body.selectLocation;
            let zip = 0;
            // If zip selected, validate against db.
            if (req.body.selectZip) {
                zip = req.body.selectZip;
                const checkZip = "SELECT EXISTS (SELECT 1 FROM zips WHERE location = (?) AND zip_code = (?))";
                await connection.query(checkZip, [location, zip], (err, results) => {
                    if (err) { throw err; }
                    const validation = Object.values(results[0]);
                    if (!(validation[0] === 1)) {
                        // Validation error for zip, re-render page with error message
                        connection.query("SELECT DISTINCT LOCATION FROM geo", (error, rows) => {
                            if (error) { throw err; }
                            const locationlist = JSON.parse(JSON.stringify(rows));
                            // tslint:disable-next-line: max-line-length
                            res.render("index", { locationVals: locationlist, userLocation: location, zipVal: zip, validationError: "invalid zipcode"} );
                        });
                    } else {
                        // Zip matched, query database for questions & answers using location and zip code
                        //
                    }
                });
            } else {
                // No zip needed, location only
                // query here
            }
        } catch (err) {
        throw (err);
        }
    }
}

export default HomeController;
