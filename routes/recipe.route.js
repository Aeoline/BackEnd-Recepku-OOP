const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const router = express.Router();

const RecipeController = require("../controllers/RecipeController");
const middleware = require("../middleware/auth.middleware");

const recipeController = new RecipeController();
const upload = multer({ storage: multer.memoryStorage() });

// Increase payload size limit
router.use(bodyParser.json({ limit: '50mb' }));
router.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

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

router.post("/recipes", [middleware.isUserMiddleware, middleware.isAdminMiddleware, upload.single('photo')], (req, res) => recipeController.addRecipe(req, res));
router.put("/recipes/:id", [middleware.isUserMiddleware, middleware.isAdminMiddleware], (req, res) => recipeController.updateRecipe(req, res));
router.delete("/recipes/:id", [middleware.isUserMiddleware, middleware.isAdminMiddleware], (req, res) => recipeController.deleteRecipes(req, res));

router.get("/favrecipes/", middleware.isUserMiddleware, (req, res) => recipeController.getFavRecipe(req, res));

module.exports = router;
