import { Request, Response } from "express";
// Import database model
import DataModel from "../models/dbModel";

let locationlist: any;
let location: string = "";
let zip: number;
let qalist: any;
let answersShown: number = 0;
let questionsPracticed: number = 0;
let values: any;

class HomeController {

    // Call async function home to retrieve locations from database
    public static home = async (req: Request, res: Response): Promise<Response | void> => {
        try {

            // Await for locationMenu promise to resolve the location list
            locationlist = await DataModel.locationMenu();

            // Render home page with locations pre-populated in the dropdown menu
            res.render("index", { locationVals: locationlist, zipVal: " 90210 " });

        } catch (err) {
            throw (err);
        }
    }

    // Call async function setLocation to validate zip before starting or start if zip is not required
    public static setLocation = async (req: Request, res: Response): Promise<Request | void> => {
        try {
            // User's selected location value
            location = req.body.selectLocation;

            // tslint:disable-next-line: no-console
            console.log("req.body.selectLocation: " + location);

            // If user enters a zip code, check if it exists in the database
            if (req.body.selectZip) {
                zip = req.body.selectZip;

                // tslint:disable-next-line: no-console
                console.log("req.body.zelectZip: " + req.body.selectZip);

                // Validate user's zip code against the database
                const validation = await DataModel.checkZip(location, zip);

                // Validation error, re-render page with error message
                if (!(validation === 1)) {
                    res.render("index", { locationVals: locationlist, userLocation: location, zipVal: zip, validationError: "invalid zipcode"} );

                // Zip matched, redirect to start route
                } else {
                    // res.redirect("/start1");
                    // res.render("index", { locationVals: locationlist, userLocation: location, zipVal: zip } );

                    values = await DataModel.startZip(location, zip);

                    qalist = JSON.parse(JSON.stringify(values));
                    qalist = qalist[0].sort((a: { question_id: number; }, b: { question_id: number; }) => (a.question_id > b.question_id ? 1 : -1));
                }

            // Zip is null, only location is needed to query the database
            // Territories and states with one congressional district do not require zip
            } else {
                zip = null;
                // res.redirect("/start1");
                // res.render("index", { locationVals: locationlist, userLocation: location, zipVal: zip } );

                if (location === "American Samoa" || location === "District Of Columbia" || location === "Guam" || location === "Northern Mariana Islands" || location === "Puerto Rico" || location === "Virgin Islands") {
                    // tslint:disable-next-line: no-console
                    console.log("got to territories");
                    // Get questions and answers from database
                    values = await DataModel.startTerritory(location);

                // For Districts at Large (Alaska) with one representative, only location is required
                } else {

                    // Get questions and answers from database with location
                    values = await DataModel.startDAL(location);
                }

                qalist = JSON.parse(JSON.stringify(values));
                qalist = qalist.sort((a: { question_id: number; }, b: { question_id: number; }) => (a.question_id > b.question_id ? 1 : -1));

            }

            res.render("index", { userLocation: location, zipVal: zip } );
            // res.render("index", { locationVals: locationlist, userLocation: location, zipVal: zip,  } );

        } catch (err) {
            throw (err);
        }
    }

    // Reset location, return to home page
    public static reset = async (req: Request, res: Response): Promise<Response | void> => {
        try {

            // Await for locationMenu promise to resolve the location list
            // locationlist = await DataModel.locationMenu();

            // Render home page with locations pre-populated in the dropdown menu
            res.redirect("/");

        } catch (err) {
            throw (err);
        }
    }

    // Call async function start to query the database for questions & answers
    // Renders start page with flashcards based on user's location and zip (if provided)
    public static start = async (req: Request, res: Response): Promise<Request | void> => {
        try {

            // Keep track of questions practiced
            questionsPracticed += 1;

            // Zip code is validated
            if (zip) {
                // tslint:disable-next-line: no-console
                console.log("if zip: " + zip);
                // Get questions and answers from database with location and zip
                const startZip = await DataModel.startZip(location, zip);

                // Parse results with JSON and format data for rendering
                qalist = JSON.parse(JSON.stringify(startZip));
                qalist = qalist[0].sort((a: { question_id: number; }, b: { question_id: number; }) => (a.question_id > b.question_id ? 1 : -1));

                // Render start page with location, questions, answers, and question index
                res.render("start", { userLocation: location, zipVal: zip, question: qalist[0].question, answer: JSON.parse(qalist[0].answer), q_index: qalist[0].question_id });

            // For territories, only location is required for the database query
            } else {

                // tslint:disable-next-line: no-console
                console.log("no zip: " + zip);
                if (location === "American Samoa" || location === "District Of Columbia" || location === "Guam" || location === "Northern Mariana Islands" || location === "Puerto Rico" || location === "Virgin Islands") {

                    // Get questions and answers from database
                    const start = await DataModel.startTerritory(location);

                    // parse results with JSON and format data for rendering
                    qalist = JSON.parse(JSON.stringify(start));
                    qalist = qalist.sort((a: { question_id: number; }, b: { question_id: number; }) => (a.question_id > b.question_id ? 1 : -1));

                    // Render start page with location, questions, answers, and question index
                    res.render("start", {userLocation: location, question: qalist[0].question, answer: JSON.parse(qalist[0].answer), q_index: qalist[0].question_id });

                // For Districts at Large (Alaska) with one representative, only location is required
                } else {

                    // Get questions and answers from database with location
                    const start = await DataModel.startDAL(location);

                    // parse results with JSON and format data for rendering
                    qalist = JSON.parse(JSON.stringify(start));
                    qalist = qalist.sort((a: { question_id: number; }, b: { question_id: number; }) => (a.question_id > b.question_id ? 1 : -1));

                    // Render start page with location, questions, answers, and question index
                    res.render("start", {userLocation: location, question: qalist[0].question, answer: JSON.parse(qalist[0].answer), q_index: qalist[0].question_id });
                }
            }

        } catch (err) {
            throw (err);
        }
    }

    // Render the next practice question
    public static question = async (req: Request, res: Response): Promise<Request | void> => {
        try {

            // GET request parameter to capture the question id
            const questionId = req.params.questionId;
            // Index for the question & answer list array, starting with 0
            const QID = questionId - 1;
            // URL parameter passed into the html template for the next question button
            const nextQuestion = (QID + 2);

            // Keep track of questions practiced
            questionsPracticed += 1;

            res.render("start", { userLocation: location, zipVal: zip, question: qalist[QID].question, answer: JSON.parse(qalist[QID].answer), q_index: questionId, next: nextQuestion });

        } catch (err) {
            throw (err);
        }
    }

    public static next = async (req: Request, res: Response): Promise<Request | void> => {
        try {

            // GET request parameter to capture the question id
            const questionId = req.params.questionId;
            // Index for the question & answer list array, starting with 0
            const QID = questionId - 1;
            // URL parameter passed into the html template for the next question button
            const nextQuestion = (QID + 2);

            // Keep track of questions practiced
            questionsPracticed += 1;

            // tslint:disable-next-line: no-console
            console.log("before, answersShown: " + answersShown);
            // tslint:disable-next-line: no-console
            console.log("req.body.nextInput " + req.body.nextInput);
            // tslint:disable-next-line: no-console
            console.log(typeof req.body.nextInput);

            if (req.body.nextInput) {
                answersShown += Number(req.body.nextInput);
                // tslint:disable-next-line: no-console
                console.log("req.body.shown = " + req.body.nextInput);
                // tslint:disable-next-line: no-console
                console.log("after, answersShown: " + answersShown);
            }

            // Keep track of questions shown

            res.render("start", { userLocation: location, zipVal: zip, question: qalist[QID].question, answer: JSON.parse(qalist[QID].answer), q_index: questionId, next: nextQuestion });

        } catch (err) {
            throw (err);
        }
    }

    public static finish = async (req: Request, res: Response): Promise<Request | void> => {
        try {
            // tslint:disable-next-line: no-console
            console.log("shown value before finishing: " + req.body.finishInput);
            // tslint:disable-next-line: no-console
            console.log(typeof req.body.finishInput);
            // tslint:disable-next-line: no-console
            console.log("answersShown: " + answersShown);
            // tslint:disable-next-line: no-console
            console.log(typeof answersShown);

            answersShown += Number(req.body.finishInput);

            res.render("finish", {practiced: questionsPracticed, shown: answersShown });

        } catch (err) {
            throw (err);
        }
    }
}

export default HomeController;
