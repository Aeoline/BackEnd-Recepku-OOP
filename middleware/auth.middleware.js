const FirebaseAdmin = require("../libs/FirebaseAdmin");
const User = require("../entities/user");
const db = FirebaseAdmin.firestore();

const isUserMiddleware = async (req, res, next) => {
    if (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer ")) {
      return res.status(401).send({
        success: false,
        message: "Unauthorized",
      });
    }
    const token = req.headers.authorization.split("Bearer ")[1];
  
    try {
      const decodedToken = await FirebaseAdmin.auth().verifyIdToken(token);
      const id = decodedToken.uid;
  
      if (!id) {
        return res.status(401).send({
          success: false,
          message: "Unauthorized",
        });
      }
  
      // tidak perlu karena tidak ada user biasa di firestore
  
      // const user = await User.getUserByUid(id);
      // if (!user) {
      //   return res.status(401).send({
      //     success: false,
      //     message: "Unauthorized",
      //   });
      // }
      // req.user = user;
      return next();
    } catch (error) {
      res.status(error.code === "auth/id-token-expired" ? 401 : 500).send({
        success: false,
        message: error.message,
      });
    }
  };
  
  const isAdminMiddleware = async (req, res, next) => {
    if (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer ")) {
      return res.status(401).send({
        success: false,
        message: "Unauthorized",
      });
    }
    const token = req.headers.authorization.split("Bearer ")[1];
  
    try {
      const decodedToken = await FirebaseAdmin.auth().verifyIdToken(token);
      const id = decodedToken.uid;
  
      if (!id) {
        return res.status(401).send({
          success: false,
          message: "Unauthorized",
        });
      }
  
      const user = await User.getUserByUid(id);
  
      if (!user || !user.isAdmin) {
        return res.status(401).send({
          success: false,
          message: "Unauthorized",
        });
      }
  
      req.user = user;
  
      return next();
    } catch (error) {
      res.status(error.code === "auth/id-token-expired" ? 401 : 500).send({
        success: false,
        message: error.message,
      });
    }
  
    return next();
  };
  module.exports = { isUserMiddleware, isAdminMiddleware };
  