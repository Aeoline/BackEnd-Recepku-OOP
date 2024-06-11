const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/AuthController");


const authController = new AuthController();


router.post("/register", (req, res) => authController.register(req, res));

router.post("/login", (req, res) => authController.login(req, res));

router.get("/verify-token", (req, res) => authController.authenticateToken(req, res));

router.get("/logout", (req, res) => authController.logout(req, res));

// router.get("/verify-token", (req, res) => authController.verifyToken(req, res));
module.exports = router;
