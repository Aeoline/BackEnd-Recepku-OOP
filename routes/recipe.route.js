const express = require("express");
const router = express.Router();

const RecipeController = require("../controllers/RecipeController");
const middleware = require("../middleware/auth.middleware");

const recipeController = new RecipeController();

router.use((req, res, next) => {
  console.log("Middleware executed Recipe");
  next();
});

router.get("/recipes", (req, res) => recipeController.getAllRecipe(req, res));

router.get("/recipes/:id", middleware.isUserMiddleware, (req, res) => recipeController.getRecipeById(req, res));
router.get("/recipes/:slug", middleware.isUserMiddleware, (req, res) => {
  recipeController.getRecipeBySlug(req, res);
}); //belum bisa
router.get("/recipes/:title", middleware.isUserMiddleware, (req, res) => {
  recipeController.searchRecipe(req, res);
});

router.post("/recipes", [middleware.isUserMiddleware, middleware.isAdminMiddleware], (req, res) => recipeController.addRecipe(req, res));
router.put("/recipes/:id", [middleware.isUserMiddleware, middleware.isAdminMiddleware], (req, res) => recipeController.updateRecipe(req, res));
router.delete("/recipes/:id", [middleware.isUserMiddleware, middleware.isAdminMiddleware], (req, res) => recipeController.deleteRecipes(req, res));


router.get("/recommended_recipes/", (req, res) => recipeController.getFavRecipe(req, res));

module.exports = router;
