var router = require("express").Router();
const { fire, uploadImage } = require('../config/dbConfig');
var bodyParser = require("body-parser");
var bcrypt = require("bcryptjs");
var db = fire.firestore();
const { v4: uuidv4 } = require("uuid");
const multer = require('multer')
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

class RecipeController {
  async getAllRecipe(req, res) {
    try {
      const makanan = [];
      const snapshot = await db.collection("makanan").get();

      snapshot.forEach((doc) => {
        makanan.push(doc.data());
      });

      res.status(200).json({
        message: "success",
        data: makanan,
      });
    } catch (err) {
      res.status(500).json({
        message: "error",
        data: err,
      });
    }
  }

  async getRecipeById(req, res) {
    try {
      const id = req.params.id;
      console.log(id);
      const doc = await db.collection("makanan").doc(id).get();

      // update search count
      let search_record = doc.data().search_record;
      search_record++;
      await db.collection("makanan").doc(id).update({
        search_record: search_record,
      });

      // return data
      res.status(200).json({
        message: "success",
        data: doc.data(),
      });
    } catch (err) {
      res.status(500).json({
        message: "error",
        data: err,
      });
    }
  }

  async getRecipeBySlug(req, res) {
    try {
      const title = req.params.title;
      console.log(title);
      const makanan = [];

      const snapshot = await db
        .collection("makanan")
        .where("title", "==", title)
        .get();

      snapshot.forEach((doc) => {
        makanan.push(doc.data());
      });

      res.status(200).json({
        message: "success",
        data: makanan,
      });
    } catch (err) {
      res.status(500).json({
        message: "error",
        data: err,
      });
    }
  }

  async searchRecipe(req, res) {
    try {
      const search = req.query;
      console.log(search);
      if (search.slug == undefined) {
        // get all makanan
        const makanan = [];
        const snapshot = await db.collection("makanan").get();

        snapshot.forEach((doc) => {
          makanan.push(doc.data());
        });

        res.status(200).json({
          message: "success",
          data: makanan,
        });
      } else {
        const key = Object.keys(search);
        const value = Object.values(search);
        value[0] = value[0].toLowerCase();

        const makanan = [];
        const snapshot = await db
          .collection("makanan")
          .where(key[0], ">=", value[0])
          .where(key[0], "<=", value[0] + "\uf8ff")
          .limit(10)
          .get();

        snapshot.forEach((doc) => {
          makanan.push(doc.data());
          console.log(doc.data());
        });

        if (makanan.length == 0) {
          res.status(200).json({
            message: "not found",
            data: makanan,
          });
        } else {
          res.status(200).json({
            message: "success",
            data: makanan,
          });
        }
      }
    } catch (err) {
      res.status(500).json({
        message: "error",
        data: err,
      });
    }
  }

  async addRecipe(req, res) {
    try {
      const data = req.body;

      const snapshot = await db
        .collection("makanan")
        .orderBy("id", "desc")
        .limit(1)
        .get();

      let lastId = 0;
      snapshot.forEach((doc) => {
        lastId = doc.data().id;
      });

      const newId = lastId + 1;

      await db.collection("makanan").doc(newId.toString()).set({
        id: newId,
        title: data.title,
        slug: data.slug,
        description: data.description,
        calories: data.calories,
        healthyCalories: data.healthyCalories,
        ingredients: data.ingredients,
        healthyIngredients: data.healthyIngredients,
        steps: data.steps,
        healthySteps: data.healthySteps,
        isFavorite: false,
        photoUrl: data.photoUrl,
        created_on: new Date().toISOString(),
      });

      console.log("Resep berhasil dibuat");
      return res.status(200).json({
        error: false,
        message: "Resep berhasil dibuat",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        error: true,
        message: error,
      });
    }
  }

  async updateRecipe(req, res) {
    try {
      const recipeId = req.params.id;
      const updatedData = req.body;

      await db.collection("makanan").doc(recipeId).update({
        title: updatedData.title,
        slug: updatedData.slug,
        description: updatedData.description,
        calories: updatedData.calories,
        healthyCalories: updatedData.healthyCalories,
        ingredients: updatedData.ingredients,
        healthyIngredients: updatedData.healthyIngredients,
        steps: updatedData.steps,
        healthySteps: updatedData.healthySteps,
        isFavorite: updatedData.isFavorite,
        photoUrl: updatedData.photoUrl,
      });

      console.log("Resep berhasil diperbarui");
      return res.status(200).json({
        error: false,
        message: "Resep berhasil diperbarui",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        error: true,
        message: error,
      });
    }
  }

  async deleteRecipe(req, res) {
    try {
      const recipeId = req.params.id;

      await db.collection("makanan").doc(recipeId).delete();

      console.log("Resep berhasil dihapus");
      return res.status(200).json({
        error: false,
        message: "Resep berhasil dihapus",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        error: true,
        message: error,
      });
    }
  }
}
module.exports = RecipeController;