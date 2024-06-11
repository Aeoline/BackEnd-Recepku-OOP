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

router.get("/favrecipes/", (req, res) => recipeController.getFavRecipe(req, res));



module.exports = router;