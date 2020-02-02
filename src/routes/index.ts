import { Router } from "express";
import homeController from "../controllers/homeController";

const router = Router();

// define GET route handler for home page
router.get( "/", (req, res, next) => {
    homeController.home(req, res);
});

// define POST route handler for home page location dropdown menu
router.post( "/", (req, res, next) => {
    homeController.setLocation(req, res);
});

router.get( "/reset", (req, res, next) => {
    homeController.reset(req, res);
});

// define GET route handler for finished
router.post( "/finish", (req, res, next) => {
    homeController.finish(req, res);
});
export default router;
