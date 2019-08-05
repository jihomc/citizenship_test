import { Request, Response } from "express";
import mysql2 from "mysql2/promise";
import pool from "../database";
// import connection from "../database";
import DataModel from "../models/dbModel";

let locationlist: any;
let location: string = "";
let zip: number;
let qalist: any;
let answersShown: number = 0;
let questionsPracticed: number = 0;

class HomeController {
    public static home = async (req: Request, res: Response): Promise<Response | void> => {
        try {
            location = "";
            zip = 0;
            locationlist = await DataModel.locationMenu();
            // tslint:disable-next-line: no-console
            // console.log(locationlist);
            res.render("index", { locationVals: locationlist, zipVal: " 20001 " });
        } catch (err) {
            throw (err);
            }
    }

    public static setLocation = async (req: Request, res: Response): Promise<Request | void> => {
        try {
            location = req.body.selectLocation;
            // console.log("locationlist: " + locationlist);
            // If zip selected, validate against db.
            if (req.body.selectZip) {
                zip = req.body.selectZip;
                const validation = await DataModel.checkZip(location, zip);
                // tslint:disable-next-line: no-console
                console.log("validation: " + validation);
                if (!(validation === 1)) {
                    // Validation error for zip, re-render page with error message
                    // tslint:disable-next-line: max-line-length
                    res.render("index", { locationVals: locationlist, userLocation: location, zipVal: zip, validationError: "invalid zipcode"} );
                } else {
                    // Zip matched, redirect to start function
                    res.redirect("/start");
                }
            // Zip is null, no validation needed. Query db with location.
            } else {
                res.redirect("/start");
            }
        } catch (err) {
            throw (err);
        }
    }
    public static start = async (req: Request, res: Response): Promise<Request | void> => {
        try {
            if (zip) {
                // Zip matched, query database for questions & answers using location and zip code
                const startZip = await DataModel.startZip(location, zip);
                // parse results with JSON and format data into an array of objects
                qalist = JSON.parse(JSON.stringify(startZip));
                // tslint:disable-next-line: max-line-length
                qalist = qalist[0].sort((a: { question_id: number; }, b: { question_id: number; }) => (a.question_id > b.question_id ? 1 : -1));
                // tslint:disable-next-line: no-console
                console.log("startZip started, index: 0");
                // tslint:disable-next-line: max-line-length
                res.render("start", { userLocation: location, zipVal: zip, question: qalist[0].question, answer: JSON.parse(qalist[0].answer), q_index: qalist[0].question_id });
            } else {
                // tslint:disable-next-line: no-console
                console.log("start function for territories started");
                // tslint:disable-next-line: max-line-length
                if (location === "American Samoa" || location === "District Of Columbia" || location === "Guam" || location === "Northern Mariana Islands" || location === "Puerto Rico" || location === "Virgin Islands") {
                    const start = await DataModel.startTerritory(location);
                    // parse results with JSON and format data into an array of objects
                    qalist = JSON.parse(JSON.stringify(start));
                    // tslint:disable-next-line: max-line-length
                    qalist = qalist.sort((a: { question_id: number; }, b: { question_id: number; }) => (a.question_id > b.question_id ? 1 : -1));
                    // tslint:disable-next-line: no-console
                    console.log(qalist);
                    // tslint:disable-next-line: no-console
                    console.log("startTerritory started, index: 0");
                    // tslint:disable-next-line: max-line-length
                    res.render("start", {userLocation: location, question: qalist[0].question, answer: JSON.parse(qalist[0].answer), q_index: qalist[0].question_id });
                } else {
                    const start = await DataModel.startDAL(location);
                    // parse results with JSON and format data into an array of objects
                    qalist = JSON.parse(JSON.stringify(start));
                    // tslint:disable-next-line: max-line-length
                    qalist = qalist.sort((a: { question_id: number; }, b: { question_id: number; }) => (a.question_id > b.question_id ? 1 : -1));
                    // tslint:disable-next-line: no-console
                    console.log(qalist);
                    // tslint:disable-next-line: no-console
                    console.log("startDAL started, index: 0");
                    // tslint:disable-next-line: max-line-length
                    res.render("start", {userLocation: location, question: qalist[0].question, answer: JSON.parse(qalist[0].answer), q_index: qalist[0].question_id });
                }
            }
        } catch (err) {
            throw (err);
        }
    }
    public static next = async (req: Request, res: Response): Promise<Request | void> => {
        try {
            questionsPracticed += 1;
            if (req.body.shown === "yes") {
                answersShown += 1;
            }
            // tslint:disable-next-line: no-console
            console.log("questions practiced: " + questionsPracticed + " answersShown: " + answersShown);
            if (req.body.q_index) {
                const QID = Number(req.body.q_index);
                // tslint:disable-next-line: no-console
                console.log("next, index: " + QID + " type: " + typeof QID);
                // tslint:disable-next-line: max-line-length
                res.render("start", { userLocation: location, zipVal: zip, question: qalist[QID].question, answer: JSON.parse(qalist[QID].answer), q_index: qalist[QID].question_id });
            }
            // tslint:disable-next-line: max-line-length
            // res.render("start", { userLocation: location, zipVal: zip, question: qalist[0].question, answer: JSON.parse(qalist[0].answer), q_id: qalist[0].question_id });
        } catch (err) {
            throw (err);
        }
    }
    public static finish = async (req: Request, res: Response): Promise<Request | void> => {
        try {
            res.render("finish", {practiced: questionsPracticed, shown: answersShown });
        } catch (err) {
            throw (err);
        }
    }
}

export default HomeController;
