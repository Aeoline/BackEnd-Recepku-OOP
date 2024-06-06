const express = require("express");
const router = express.Router();

const MainController = require("../controllers/MainController");

const mainController = new MainController;

router.get("/getTotalRecipes", (req, res) => mainController.getSizeRecipes(req, res));
router.get("/getTotalUsers", (req, res) => mainController.getSizeUsers(req, res));
router.get("/getLatestRecipes", (req, res) => mainController.getLatestRecipes(req, res));
router.get("/getLatestUsers", (req, res) => mainController.getLatestUsers(req, res));


module.exports = router;