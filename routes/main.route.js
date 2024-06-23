const express = require("express");
const router = express.Router();

const MainController = require("../controllers/MainController");

const mainController = new MainController();

const middleware = require("../middleware/auth.middleware");

// Tambahkan logging untuk debugging
router.use((req, res, next) => {
  console.log("Middleware executed Main");
  next();
});



router.get("/getTotalRecipes",[middleware.isUserMiddleware, middleware.isAdminMiddleware], (req, res) => mainController.getSizeRecipes(req, res));
router.get("/getTotalUsers", [middleware.isUserMiddleware, middleware.isAdminMiddleware], (req, res) => mainController.getSizeUsers(req, res));
router.get("/getLatestRecipes", [middleware.isUserMiddleware, middleware.isAdminMiddleware], (req, res) => mainController.getLatestRecipes(req, res));
router.get("/getLatestUsers", [middleware.isUserMiddleware, middleware.isAdminMiddleware], (req, res) => mainController.getLatestUsers(req, res));

module.exports = router;
