const { fire, uploadImage } = require('../config/dbConfig');
var db = fire.firestore();
const Recipe = require("../entities/recipe");
const User = require("../entities/user");

class MainController {
  async getSizeRecipes(req, res) {
    try {
      const recipes = (await Recipe.getAll()).map((recipe) => ({
        id: recipe.id,
        title: recipe.title,
        calories: recipe.calories,
      }));

      const recipeSize = recipes.length;

      const data = {
        recipe: {
          title: "Resep Makanan",
          data: recipes,
          size: recipeSize,
        }
      };

      res.status(200).json({
        success: true,
        message: "All data fetched successfully",
        data: {
          size: recipeSize
        }
      });
      
    } catch (err) {
      console.error('Error fetching data:', err);  // Log the error
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: err.message,  // Provide the error message
      });
    }
  }

  async getSizeUsers(req, res) {
    try {
      const users = (await User.getAll()).map((user) => ({
        id: user.id,
        title: user.title,
        calories: user.calories,
      }));

      const userSize = users.length;

      const data = {
        recipe: {
          title: "User",
          data: users,
          size: userSize,
        }
      };

      res.status(200).json({
        success: true,
        message: "All data fetched successfully",
        data: {
          size: userSize
        }
      });
      
    } catch (err) {
      console.error('Error fetching data:', err);  // Log the error
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: err.message,  // Provide the error message
      });
    }
  }

  async getLatestRecipes(req, res) {
    try {
      const recipes = (await Recipe.getAll()).slice(0, 5).map((recipe) => ({
        id: recipe.id,
        photo: recipe.photoUrl,
        title: recipe.title,
        calories: recipe.calories,
      }));
  
      const data = {
        recipe: {
          title: "Resep Makanan",
          data: recipes,
        }
      };
  
      res.status(200).json({
        success: true,
        message: "Top 5 data fetched successfully",
        data: data,
      });
    } catch (err) {
      console.error('Error fetching data:', err);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: err.message,
      });
    }
  }

  async getLatestUsers(req, res) {
    try {
      const users = (await User.getAll()).slice(0, 5).map((user) => ({
        uid: user.uid,
        username: user.username,
        email: user.email,
        role: user.isAdmin,
      }));
  
      const data = {
        user: {
          title: "Users",
          data: users,
        }
      };
  
      res.status(200).json({
        success: true,
        message: "Top 5 data fetched successfully",
        data: data,
      });
    } catch (err) {
      console.error('Error fetching data:', err);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: err.message,
      });
    }
  }
  
}

module.exports = MainController;
