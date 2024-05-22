const { v4: uuidv4 } = require("uuid");
const { z } = require("zod");
const FirebaseAdmin = require("firebase-admin");

class User {
  constructor(data) {
    this.id = data.uid;
    this.email = data.email;
    this.nama = data.nama;
    this.isAdmin = data.isAdmin || false;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  static schema() {
    return z.object({
      id: z.string({ required_error: "ID user is required" }),
      email: z.string({ required_error: "Email is required" }),
      nama: z.string({ required_error: "Nama is required" }),
      isAdmin: z.boolean().optional(),
      createdAt: z.date().optional(),
      updatedAt: z.date().optional(),
    });
  }

  validate(data) {
    const result = User.schema().safeParse(data);
    if (!result.success) {
      throw new Error(
        `Validation errors: ${result.error.issues
          .map((i) => `${i.path}: ${i.message}`)
          .join(", ")}`
      );
    }
    return result.data;
  }

  static async createUser(userData) {
    const validatedData = this.validate(userData);
    const newUser = new User(validatedData);

    // Initialize Firestore reference
    const dbRef = FirebaseAdmin.firestore().collection("users");
    await dbRef.doc(newUser.uid).set(newUser);
    return newUser;
  }

  static async getUserByUid(uid) {
    // Initialize Firestore reference
    const dbRef = FirebaseAdmin.firestore().collection("users");
    const doc = await dbRef.doc(uid).get();
    if (!doc.exists) {
      throw new Error("User not found");
    }
    return new User(doc.data());
  }
}

module.exports = User;