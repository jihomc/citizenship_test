import { Router } from "express";
import homeController from "../controllers/homeController";

const router = Router();

// /question
router.get("/", (req, res) => {
    res.redirect("/");
});

// /question/questionId
router.get( "/:questionId", (req, res, next) => {
    homeController.question(req, res);
});

router.post( "/:questionId", (req, res, next) => {
    homeController.next(req, res);
});

const questions = router;
export {questions};
