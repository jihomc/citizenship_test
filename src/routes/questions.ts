import { Router } from "express";
import homeController from "../controllers/homeController";

const router = Router();

// URL ending in /question redirects to home page
router.get("/", (req, res) => {
    res.redirect("/");
});

// Get the current question
router.get( "/:questionId", (req, res, next) => {
    homeController.question(req, res);
});

// Go to the next question
router.post( "/:questionId", (req, res, next) => {
    homeController.next(req, res);
});

const questions = router;
export {questions};
