const express = require("express");
const router = express.Router();

const RecipeController = require("../controllers/RecipeController");
const MainController = require("../controllers/MainController");
const middleware = require("../middleware/auth.middleware");

const recipeController = new RecipeController;
const mainController = new MainController;



router.get("/recipes", (req, res) => recipeController.getAllRecipe(req, res));
router.get("/recipes/:id", (req, res) => recipeController.getRecipeById(req, res));
router.get("/recipes/:slug", (req, res) => {
    recipeController.getRecipeBySlug(req, res);
  }); //blm bisa
router.get("/recipes/:title", (req, res) => {
    recipeController.searchRecipe(req, res);
  });

  router.use((req, res, next) => {
    console.log("Middleware executed");
    next();
  });
  
router.post("/recipes", [middleware.isUserMiddleware, middleware.isAdminMiddleware], (req, res) => recipeController.addRecipe(req, res));
router.put("/recipes/:id", [middleware.isUserMiddleware, middleware.isAdminMiddleware], (req, res) => recipeController.updateRecipe(req, res));
router.delete("/recipes/:id", [middleware.isUserMiddleware, middleware.isAdminMiddleware], (req, res) => recipeController.deleteRecipe(req, res));

router.get("/favrecipes/", (req, res) => recipeController.getFavRecipe(req, res));



module.exports = router;