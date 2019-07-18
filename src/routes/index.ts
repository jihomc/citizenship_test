import { Router } from "express";
import homeController from "../controllers/homeController";

const router = Router();

// define GET route handler for home page
router.get( "/", homeController.home );

// define POST route handler for home page location dropdown menu
// router.post( "/", homeController.setLocation );

export default router;
