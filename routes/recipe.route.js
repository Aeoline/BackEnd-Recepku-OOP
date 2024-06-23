const express = require('express');
const app = express();

// Set the payload limit to 10MB (adjust as needed)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const RecipeController = require("./controllers/RecipeController");
const middleware = require("./middleware/auth.middleware");

const recipeController = new RecipeController();

const router = express.Router();

router.get("/recipes", middleware.isUserMiddleware, (req, res) => recipeController.getAllRecipe(req, res));
router.get("/recipes/:id", middleware.isUserMiddleware, (req, res) => recipeController.getRecipeById(req, res));
router.get("/recipes/:slug", middleware.isUserMiddleware, (req, res) => {
  recipeController.getRecipeBySlug(req, res);
}); // belum bisa
router.get("/recipes/:title", middleware.isUserMiddleware, (req, res) => {
  recipeController.searchRecipe(req, res);
});

router.use((req, res, next) => {
  console.log("Middleware executed");
  next();
});

router.post("/recipes", [middleware.isUserMiddleware, middleware.isAdminMiddleware], (req, res) => recipeController.addRecipe(req, res));
router.put("/recipes/:id", [middleware.isUserMiddleware, middleware.isAdminMiddleware], (req, res) => recipeController.updateRecipe(req, res));
router.delete("/recipes/:id", [middleware.isUserMiddleware, middleware.isAdminMiddleware], (req, res) => recipeController.deleteRecipes(req, res));

router.get("/favrecipes/", middleware.isUserMiddleware, (req, res) => recipeController.getFavRecipe(req, res));

app.use('/api', router);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
