const { fire } = require("../config/dbConfig");
const User = require("../entities/user");
const db = fire.firestore();
const jwt = require("jsonwebtoken");

const secretKey = "MyLovelyYaeMiko";

const isUserMiddleware = async (req, res, next) => {
  if (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer ")) {
    console.log("No token found in request:", req.headers.authorization); // Logging no token
    return res.status(401).send({
      success: false,
      message: "Unauthorized",
    });
  }

  const token = req.headers.authorization.split("Bearer ")[1];
  // console.log("Token found in request:", token); // Logging token

  try {
    if (!token) {
      console.log("No token found in request:", token); // Logging no token
      return res.status(401).json({
        error: true,
        message: "Unauthorized",
      });
    }

    jwt.verify(token, secretKey, (err, user) => {
      if (err) {
        console.log("JWT verification error:", err); // Logging error
        return res.status(401).json({
          error: true,
          message: "Unauthorized",
        });
      }
      req.user = user;
      console.log("User authenticated:", user); // Logging user
      next();
    });
  } catch (error) {
    console.log("Token processing error:", error); // Logging error
    res.status(error.code === "auth/id-token-expired" ? 401 : 500).send({
      success: false,
      message: error.message,
    });
  }
};

const isAdminMiddleware = async (req, res, next) => {
  if (!req.user) {
    console.log("No user found in request:", req.user); // Logging no user
    return res.status(401).send({
      success: false,
      message: "Unauthorized",
    });
  }

  if (!req.user.isAdmin) {
    console.log("User is not an admin:", req.user); // Logging non-admin user
    return res.status(403).json({
      error: true,
      message: "Forbidden isAdminMiddleware",
    });
  }

  console.log("User is admin:", req.user); // Logging admin user
  next();
};

module.exports = { isUserMiddleware, isAdminMiddleware };
