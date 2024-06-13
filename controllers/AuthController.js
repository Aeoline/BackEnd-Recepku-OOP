var router = require("express").Router();
const { fire, uploadImage } = require("../config/dbConfig");
var bodyParser = require("body-parser");
var bcrypt = require("bcryptjs");
var db = fire.firestore();
const { v4: uuidv4 } = require("uuid");
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
const jwt = require("jsonwebtoken");
const { getAuth } = require("firebase-admin/auth");
const User = require("../entities/user");

const secretKey = "MyLovelyYaeMiko";

function convertTZ(date, tzString) {
  return new Date(
    (typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {
      timeZone: tzString,
    })
  );
}

class AuthController {
  async login(req, res) {
    try {
      const { username, password } = req.body;

      // Cari pengguna berdasarkan username atau email
      const userSnapshot = await db
        .collection("users")
        .where("username", "==", username)
        .get();

      if (userSnapshot.empty) {
        return res.status(401).json({ message: "Username or email not found" });
      }

      const user = userSnapshot.docs[0].data();

      // Bandingkan password
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid password" });
      }

      // Buat token JWT
      const token = jwt.sign(
        {
          uid: user.uid,
          username: user.username,
          email: user.email,
          image_url: user.image_url,
          isAdmin: user.isAdmin,
        },
        secretKey,
        { expiresIn: "1h" }
      );

      // Simpan token di cookie
      res.cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Set to true in production
        maxAge: 3600000, // 1 hour
        path: "/", // Ensure the cookie is accessible on all routes
      });

      // Simpan informasi pengguna ke dalam sesi
      req.session.uid = user.uid;
      req.session.username = user.username;
      req.session.email = user.email;
      req.session.image_url = user.image_url;
      req.session.isAdmin = user.isAdmin;

      console.log(`Welcome ${req.session.username}`);

      return res.status(200).json({
        error: false,
        message: `Welcome ${req.session.username}`,
        data: req.session,
        token: token,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async register(req, res) {
    try {
      const { username, password, email } = req.body;

      // Validasi panjang username
      if (username.length < 5 || username.length > 20) {
        return res.status(400).json({
          error: true,
          message: "Username harus antara 5-20 karakter",
        });
      }

      // Validasi panjang password
      if (password.length < 7) {
        return res.status(400).json({
          error: true,
          message: "Password harus lebih dari 7 karakter",
        });
      }

      // Validasi email
      if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        return res.status(400).json({
          error: true,
          message: "Email tidak valid",
        });
      }

      // Cek apakah username sudah terdaftar
      const usernameExists = await db
        .collection("users")
        .where("username", "==", username)
        .get();
      if (!usernameExists.empty) {
        return res.status(400).json({
          error: true,
          message: `Username ${username} sudah terdaftar`,
        });
      }

      // Cek apakah email sudah terdaftar
      const emailExists = await db
        .collection("users")
        .where("email", "==", email)
        .get();
      if (!emailExists.empty) {
        return res.status(400).json({
          error: true,
          message: `Email ${email} sudah terdaftar`,
        });
      }

      // Generate UUID
      let uid;
      do {
        uid = uuidv4();
      } while (
        await db
          .collection("users")
          .where("uid", "==", uid)
          .get()
          .then((doc) => !doc.empty)
      );

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Simpan user ke database
      await db
        .collection("users")
        .doc(`/${uid}/`)
        .create({
          uid,
          username,
          password: hashedPassword,
          email,
          isAdmin: false,
          image_url:
            "https://storage.googleapis.com/capstone-bangkit-bucket/Photo-Profile/dummy_photo_profile.png",
          created_on: convertTZ(new Date(), "Asia/Jakarta"),
        });

      console.log("User berhasil dibuat");
      return res.status(200).json({
        error: false,
        message: "User berhasil dibuat",
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        error: true,
        message: "Internal server error",
      });
    }
  }

  // async verifyToken(req, res) {
  //   if (
  //     !req.headers.authorization ||
  //     !req.headers.authorization.startsWith("Bearer ")
  //   ) {
  //     return res.status(401).send({
  //       success: false,
  //       message: "Unauthorized",
  //     });
  //   }
  //   const idToken = req.headers.authorization.split("Bearer ")[1];

  //   try {
  //     const decodedToken = await getAuth().verifyIdToken(idToken);
  //     const uid = decodedToken.uid;

  //     if (!uid) {
  //       return res.status(401).send({
  //         success: false,
  //         message: "Unauthorized",
  //       });
  //     }

  //     const user = await User.getUserByUid(uid);
  //     if (!user) {
  //       return res.status(401).send({
  //         success: false,
  //         message: "Unauthorized",
  //       });
  //     }

  //     return res.status(200).send({
  //       success: true,
  //       message: "Token is valid",
  //       data: {
  //         id: uid,
  //         nama: user.name,
  //         email: user.email,
  //         isAdmin: user.isAdmin,
  //       },
  //     });
  //   } catch (error) {
  //     res.status(error.code === "auth/id-token-expired" ? 401 : 500).send({
  //       success: false,
  //       message: error.message,
  //     });
  //   }
  // }

  async authenticateToken(req, res) {
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
      if (err) {
        return res.status(403).json({
          error: true,
          message: "Forbidden",
        });
      }
      req.user = user;
      return res.status(200).json({
        error: false,
        message: "Token is valid",
        data: req.user,
      });
    });
  }

  async logout(req, res) {
    try {
      // Hapus token dari sesi atau basis data jika disimpan di sana
      req.session = null; // Contoh untuk menghapus sesi

      // Menghapus token dari cookie
      res.clearCookie("access_token", { path: "/" });

      return res.status(200).json({ message: "Logged out successfully" });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async refereshToken(req, res) {
    const user = req.user;

    // Generate new token
    const newToken = jwt.sign(
      {
        uid: user.uid,
        username: user.username,
        email: user.email,
        image_url: user.image_url,
        isAdmin: user.isAdmin,
      },
      secretKey,
      { expiresIn: "1h" }
    );

    // Send new token to client
    res.json({
      error: false,
      token: newToken,
    });
  }
}

module.exports = AuthController;
