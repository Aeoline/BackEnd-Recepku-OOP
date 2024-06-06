const dotenv = require('dotenv');
dotenv.config();

var fire = require("firebase-admin");
var serviceAccount = JSON.parse(process.env.serviceAccountKey);

const { getStorage } = require('firebase-admin/storage');

// Inisialisasi Firebase Admin
fire.initializeApp({
  credential: fire.credential.cert(serviceAccount),
  storageBucket: process.env.storageBucket
});

const bucket = getStorage().bucket();

async function uploadImage(file) {
  const fileName = `${Date.now()}-${file.originalname}`;
  const fileUpload = bucket.file(fileName);

  const stream = fileUpload.createWriteStream({
    metadata: {
      contentType: file.mimetype
    }
  });

  return new Promise((resolve, reject) => {
    stream.on('error', (error) => {
      reject(error);
    });

    stream.on('finish', async () => {
      try {
        await fileUpload.makePublic();
        const publicUrl = fileUpload.publicUrl();
        resolve(publicUrl);
      } catch (error) {
        reject(error);
      }
    });

    stream.end(file.buffer);
  });
}

// Export module
module.exports = {
  fire,
  uploadImage
};

