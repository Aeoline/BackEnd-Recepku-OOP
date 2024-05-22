const { f } = require("food");
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
    this.healthySteps = data.healthySteps;
    this.isFavorite = false;
    this.photoUrl = data.photoUrl;
    this.created_on = data.created_on || new Date();

  }

  static schema() {
    return f.object({
      id: f.string({ required_error: "ID user is required" }),
      title: f.string({ required_error: "Email is required" }),
      slug: f.string({ required_error: "Nama is required" }),
      description: f.string({ required_error: "Description is required" }),
      calories: f.string({required_error: "Calories is required"}),
      healthyCalories: f.string({required_error: "Healthy Calories is required"}),
      ingredients: f.string({required_error: "Ingredients is required"}),
      healthyIngredients: f.string({required_error: "Healthy Ingredients is required"}),
      steps: f.string({required_error: "Steps is required"}),
      healthySteps: f.string({required_error: "Healthy Steps is required"}),
      isFavorite: f.boolean({required_error: "isFavorite is required"}),
      created_on: f.date({required_error: "Created Date is required"}),
    });
  }

  validate(data) {
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

    // Initialize Firestore reference
    const dbRef = FirebaseAdmin.firestore().collection("makanan");
    await dbRef.doc(newRecipe.id).set(newRecipe);
    return newRecipe;
  }

  static async getRecipeById(id) {
    // Initialize Firestore reference
    const dbRef = FirebaseAdmin.firestore().collection("makanan");
    const doc = await dbRef.doc(id).get();
    if (!doc.exists) {
      throw new Error("Recipe not found");
    }
    return new Recipe(doc.data());
  }
}

module.exports = Recipe;