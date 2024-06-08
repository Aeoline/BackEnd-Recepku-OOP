const express = require("express");
const router = express.Router();

const RecipeController = require("../controllers/RecipeController");
const MainController = require("../controllers/MainController");

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
router.post("/recipes", (req, res) => recipeController.addRecipe(req, res));
router.put("/recipes/:id", (req, res) => recipeController.updateRecipe(req, res));
router.delete("/recipes/:id", (req, res) => recipeController.deleteRecipe(req, res));
router.get("/favrecipes/", (req, res) => recipeController.getFavRecipe(req, res));

router.get("/main/getTotalRecipe", (req, res) => mainController.getAllData(req, res));

module.exports = router;