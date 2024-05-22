var router = require("express").Router();
var fire = require("../config/dbConfig");
var bodyParser = require("body-parser");
var bycript = require("bcryptjs");
var db = fire.firestore();
const { v4: uuidv4 } = require("uuid");
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
const jwt = require("jsonwebtoken");

// middleware for authentication token with jason web token decoder
const secretKey = "MyLovelyYaeMiko";
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  console.log(token);
  if (token == null) {
    return res.status(401).json({
      error: true,
      message: "Unauthorized",
    });
  }
  jwt.verify(token, secretKey, (err, user) => {
    console.log(jwt.decode(token));
    if (err) {
      return res.status(403).json({
        error: true,
        message: "Forbidden",
      });
    }
    req.user = user;
    next();
  });
}

// timestamp
db.settings({
  timestampsInSnapshots: true,
});

// timezone jakarta
function convertTZ(date, tzString) {
  return new Date(
    (typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {
      timeZone: tzString,
    })
  );
}

// generate uuid
function generateID() {
  var uid = uuidv4();
  db.collection("users")
    .where("uid", "==", uid)
    .get()
    .then((doc) => {
      if (doc.empty) {
        console.log(uid);
        return uid;
      } else {
        generateID();
      }
    });
}




// route for authenticated user by token without session
router.get("/user", authenticateToken, (req, res) => {
  console.log(req.user);
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  return res.status(200).json({
    error: false,
    message: "Berhasil mendapatkan user",
    data: req.user,
    token: token,
  });
});

// route for logout with token
router.get("/logout", authenticateToken, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Logout berhasil");
      req.user = null;
      return res.status(200).json({
        error: false,
        message: "Logout berhasil",
      });
    }
  });
});



// export router
module.exports = router;
