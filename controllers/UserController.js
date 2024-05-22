var router = require("express").Router();
var fire = require("../config/dbConfig");
var bodyParser = require("body-parser");
var bcrypt = require("bcryptjs");
var db = fire.firestore();
const { v4: uuidv4 } = require("uuid");
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
const jwt = require("jsonwebtoken");

class UserController {
  async getAllUsers(req, res) {
    try {
      const usersRef = db.collection("users");
      const snapshot = await usersRef.get();

      if (snapshot.empty) {
        console.log("Tidak ada user");
        return res.status(200).json({
          error: true,
          message: "Tidak ada user",
        });
      } else {
        const users = [];
        snapshot.forEach((doc) => {
          users.push(doc.data());
        });
        console.log(users);
        return res.status(200).json({
          error: false,
          message: "Berhasil mendapatkan semua user",
          data: users,
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        error: true,
        message: error.message,
      });
    }
  }

  async getUserById(req, res) {
    try {
      const uid = req.params.uid;
      console.log(uid);
      const doc = await db.collection("users").doc(uid).get();

      // Mengembalikan data
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

  async editUser(req, res) {
    try {
      const userId = req.params.uid;
      const updatedData = req.body;

      // Update recipe in database
      await db.collection("users").doc(userId).update({
        isAdmin: updatedData.isAdmin,
      });

      console.log("Role berhasil diperbarui");
      return res.status(200).json({
        error: false,
        message: "Role berhasil diperbarui",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        error: true,
        message: error,
      });
    }
  }

  async deleteUser(req, res) {
    const { uid } = req.params;

    try {
      const userIds = uid.split(","); // Memisahkan ID pengguna yang dipisahkan oleh koma menjadi array
      const deletePromises = userIds.map(async (userId) => {
        const docRef = db.collection("users").doc(userId);
        const user = await docRef.get();

        if (!user.exists) {
          return {
            userId,
            success: false,
            message: "User not found",
          };
        }

        await docRef.delete();

        return {
          userId,
          success: true,
          message: "Delete user successfully",
        };
      });

      const results = await Promise.all(deletePromises);

      res.status(200).json(results);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = UserController;
