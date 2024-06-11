const express = require("express");
const router = express.Router();

const RecipeController = require("../controllers/RecipeController");
const MainController = require("../controllers/MainController");

const recipeController = new RecipeController;
const mainController = new MainController;

router.get("/recipes_a", (req, res) => recipeController.getAllRecipe(req, res));
router.get("/recipes_a/:id", (req, res) => recipeController.getRecipeById(req, res));
router.get("/recipes_a/:slug", (req, res) => {
    recipeController.getRecipeBySlug(req, res);
  }); //blm bisa
router.get("/recipes_a/:title", (req, res) => {
    recipeController.searchRecipe(req, res);
  });

router.get("/favrecipes_a/", (req, res) => recipeController.getFavRecipe(req, res));



module.exports = router;