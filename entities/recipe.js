const { z } = require("zod");
const FirebaseAdmin = require("firebase-admin");


class Recipe {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.slug = data.slug;
    this.description = data.description;
    this.calories = data.calories;
    this.healthyCalories = data.healthyCalories;
    this.ingredients = data.ingredients;
    this.healthyIngredients = data.healthyIngredients;
    this.steps = data.steps;
    this.healthySteps = Array.isArray(data.healthySteps) ? data.healthySteps : [data.healthySteps];
    this.isFavorite = data.isFavorite
    this.photoUrl = data.photoUrl;
    this.created_on = data.created_on || new Date();
  }

  static schema() {
    return z.object({
      id: z.string().nonempty("ID user is required"),
      title: z.string().nonempty("Title is required"),
      slug: z.string().nonempty("Slug is required"),
      description: z.string().nonempty("Description is required"),
      calories: z.string().nonempty("Calories is required"),
      healthyCalories: z.string().nonempty("Healthy Calories is required"),
      ingredients: z.string().nonempty("Ingredients is required"),
      healthyIngredients: z.string().nonempty("Healthy Ingredients is required"),
      steps: z.array(z.string()).nonempty("Steps is required"),
      healthySteps: z.array(z.string()).nonempty("Healthy Steps is required"),
      isFavorite: z.boolean().default(false),
      created_on: z.date().default(new Date()),
    });
  }

  static validate(data) {
    const result = Recipe.schema().safeParse(data);
    if (!result.success) {
      throw new Error(
        `Validation errors: ${result.error.issues
          .map((i) => `${i.path}: ${i.message}`)
          .join(", ")}`
      );
    }
    return result.data;
  }

  static async createRecipe(recipeData) {
    const validatedData = this.validate(recipeData);
    const newRecipe = new Recipe(validatedData);

    const dbRef = FirebaseAdmin.firestore().collection("makanan");
    await dbRef.doc(newRecipe.id).set(newRecipe);
    return newRecipe;
  }

  static async getRecipeById(id) {
    const dbRef = FirebaseAdmin.firestore().collection("makanan");
    const doc = await dbRef.doc(id).get();
    if (!doc.exists) {
      throw new Error("Recipe not found");
    }
    return new Recipe(doc.data());
  }

  static async getAll() {
    try {
      const dbRef = FirebaseAdmin.firestore().collection("makanan");
      const snapshot = await dbRef.orderBy("created_on", "desc").get();
      if (snapshot.empty) {
        throw new Error("No Recipe records found.");
      }
      return snapshot.docs.map((doc) => new Recipe(doc.data()));
    } catch (error) {
      console.error('Error in Recipe.getAll:', error);  // Log error detail
      throw error;  // Re-throw the error after logging it
    }
  }

  
  
}

module.exports = Recipe;
