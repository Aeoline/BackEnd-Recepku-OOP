const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");

const userController = new UserController();

const middleware = require("../middleware/auth.middleware");


// Tambahkan logging untuk debugging
router.use((req, res, next) => {
    console.log("Middleware executed");
    next();
  });
  
  // Gunakan middleware dengan urutan yang benar
  router.use(middleware.isUserMiddleware);
  router.use(middleware.isAdminMiddleware);

  

router.get("/users", (req, res) => userController.getAllUsers(req, res));
router.get("/users/:uid", (req, res) => userController.getUserById(req, res));
router.put("/users/:uid", (req, res) => userController.editUser(req, res));
router.delete("/users/:uid", (req, res) => userController.deleteUser(req, res));

module.exports = router;