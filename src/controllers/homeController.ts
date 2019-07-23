import { Request, Response } from "express";
import connection from "../database";
import DataModel from "../models/dbModel";

let location: string = "";
let zip: number;

class HomeController {
    public static home = async (req: Request, res: Response): Promise<Response | void> => {
        try {
            // const conn = await connect();
            const locations = await DataModel.locationMenu;
            locations().then( (locationlist) => {
                // tslint:disable-next-line: no-console
                console.log(locationlist);
                res.render("index", { locationVals: locationlist, zipVal: " 20001 " });
            });
            // await connection.query("SELECT DISTINCT LOCATION FROM geo", (err, rows) => {
            //     if (err) { throw err; }
            //     const locationlist = JSON.parse(JSON.stringify(rows));
            //     // console.log(answerlist);
            // });
        } catch (err) {
            throw (err);
            }
    }

    public static setLocation = async (req: Request, res: Response): Promise<Request | void> => {
        try {
            location = req.body.selectLocation;
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
                        res.redirect("/start");
                    }
                });
            // Zip is null, no validation needed. Query db with location.
            } else {
                // tslint:disable-next-line: no-console
                console.log(location);
                res.redirect("/start");
            }
        } catch (err) {
        throw (err);
        }
    }

    public static start = async (req: Request, res: Response, loc: any): Promise<Request | void> => {
        try {
            res.render("index");
        } catch (err) {
            throw (err);
        }
    }
}

export default HomeController;
