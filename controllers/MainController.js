var router = require("express").Router();
var fire = require("../config/dbConfig");
var bodyParser = require("body-parser");
var bcrypt = require("bcryptjs");
var db = fire.firestore();
const { v4: uuidv4 } = require("uuid");
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

class MainController {
    async getAllData(req, res) {
      try {
        const recipes = [];
        const users = [];
        const recipesSnapshot = await db.collection("makanan").get();
        const usersSnapshot = await db.collection("users").get();
  
        recipesSnapshot.forEach((doc) => {
          recipes.push(doc.data());
        });
  
        usersSnapshot.forEach((doc) => {
          users.push(doc.data());
        });
  
        res.status(200).json({
          message: "success",
          data: {
            totalRecipes: recipes.length,
            totalUsers: users.length,
            recipes: recipes,
            users: users
          }
        });
      } catch (err) {
        res.status(500).json({
          message: "error",
          data: err
        });
      }
    }
  }

module.exports = MainController;