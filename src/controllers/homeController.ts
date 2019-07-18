import { Request, Response } from "express";
import { connect } from "../database";
// import express from "express";

class HomeController {

    public static home = async (req: Request, res: Response): Promise<Response | void> => {
        try {
            const conn = await connect();
            const locationMenu = await conn.query("SELECT DISTINCT LOCATION FROM geo", (err, rows) => {
                if (err) { throw err; }
                const answerlist = JSON.parse(JSON.stringify(rows));
                // tslint:disable-next-line: no-console
                console.log(answerlist);
                res.render("index", { locationVals: answerlist });
            });
        } catch (err) {
            throw (err);
        }
    }
}

export default HomeController;
