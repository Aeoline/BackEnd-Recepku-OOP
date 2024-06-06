var router = require("express").Router();
const { fire, uploadImage } = require('../config/dbConfig');
var bodyParser = require("body-parser");
var bcrypt = require("bcryptjs");
var db = fire.firestore();
const { v4: uuidv4 } = require("uuid");
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
const jwt = require("jsonwebtoken");

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
      const user = await db
        .collection("users")
        .where("username", "==", username)
        .get();

      if (user.empty) {
        return res.status(401).json({ message: "Username or email not found" });
      }

      // Bandingkan password
      const isValid = await bcrypt.compare(
        password,
        user.docs[0].data().password
      );
      if (!isValid) {
        return res.status(401).json({ message: "Invalid password" });
      }

      // Buat token JWT
      const token = jwt.sign(
        {
          uid: user.docs[0].data().uid,
          username: user.docs[0].data().username,
          email: user.docs[0].data().email,
          image_url: user.docs[0].data().image_url,
          isAdmin: user.docs[0].data().isAdmin,
        },
        secretKey,
        { expiresIn: "1h" }
      );

      // Simpan informasi pengguna ke dalam sesi
      req.session.uid = user.docs[0].data().uid;
      req.session.username = user.docs[0].data().username;
      req.session.email = user.docs[0].data().email;
      req.session.image_url = user.docs[0].data().image_url;
      req.session.isAdmin = user.docs[0].data().isAdmin;

      console.log(`Welcome ${req.session.username}`);
      return res.status(200).json({
        error: false,
        message: `Welcome ${req.session.username}`,
        data: req.session,
        token: token,
      });
    } catch (err) {
      console.error(err);
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
            message: 'Username harus antara 5-20 karakter',
          });
        }
  
        // Validasi panjang password
        if (password.length < 7) {
          return res.status(400).json({
            error: true,
            message: 'Password harus lebih dari 7 karakter',
          });
        }
  
        // Validasi email
        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
          return res.status(400).json({
            error: true,
            message: 'Email tidak valid',
          });
        }
  
        // Cek apakah username sudah terdaftar
        const usernameExists = await db.collection('users')
          .where('username', '==', username)
          .get();
        if (!usernameExists.empty) {
          return res.status(400).json({
            error: true,
            message: `Username ${username} sudah terdaftar`,
          });
        }
  
        // Cek apakah email sudah terdaftar
        const emailExists = await db.collection('users')
          .where('email', '==', email)
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
        } while (await db.collection('users')
          .where('uid', '==', uid)
          .get()
          .then(doc => !doc.empty));
  
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
  
        // Simpan user ke database
        await db.collection('users')
          .doc(`/${uid}/`)
          .create({
            uid,
            username,
            password: hashedPassword,
            email,
            isAdmin: false,
            image_url: 'https://storage.googleapis.com/capstone-bangkit-bucket/Photo-Profile/dummy_photo_profile.png',
            created_on: convertTZ(new Date(), 'Asia/Jakarta'),
          });
  
        console.log('User berhasil dibuat');
        return res.status(200).json({
          error: false,
          message: 'User berhasil dibuat',
        });
      } catch (err) {
        console.error(err);
        return res.status(500).json({
          error: true,
          message: 'Internal server error',
        });
      }
  }
  
}

module.exports = AuthController;
