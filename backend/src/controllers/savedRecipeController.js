// backend/controllers/savedRecipeController.js
const db = require("../config/db");

exports.saveRecipe = async (req, res) => {
  const { userId, recipeApiId, recipeLink, title, image } = req.body;

  if (!userId || !recipeApiId || !recipeLink || !title) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO savedrecipe (userId, recipeApiId, recipeLink, title, image, dateSaved)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [userId, recipeApiId, recipeLink, title, image || null]
    );

    res.status(201).json({
      message: "Recipe saved successfully",
      savedRecipeId: result.insertId,
    });
  } catch (error) {
    console.error("Error saving recipe:", error);
    res.status(500).json({ message: "Failed to save recipe" });
  }
};

exports.getSavedRecipeById = async (req, res) => {
  const { id } = req.params;
  try {
    const [[recipe]] = await db.query(
      `SELECT id, userId, recipeApiId, recipeLink, title, image, notes, dateSaved 
       FROM savedrecipe 
       WHERE id = ?`,
      [id]
    );

    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    res.json(recipe);
  } catch (error) {
    console.error("Error fetching saved recipe:", error);
    res.status(500).json({ message: "Failed to fetch saved recipe" });
  }
};

// Get grocery list (ingredients) for a saved Spoonacular recipe
exports.getSavedRecipeGroceryList = async (req, res) => {
  const recipeId = req.params.id;
  try {
    const [[recipe]] = await db.query(
      `SELECT id, title, recipeApiId FROM savedrecipe WHERE id = ?`,
      [recipeId]
    );

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    // Fetch ingredients from Spoonacular API if not stored locally
    const response = await fetch(
      `https://api.spoonacular.com/recipes/${recipe.recipeApiId}/information?includeNutrition=false&apiKey=${process.env.SPOONACULAR_API_KEY}`
    );

    const data = await response.json();
    // console.log("🔍 Spoonacular response:", data);

    if (!data.extendedIngredients) {
      return res.status(404).json({ message: "No ingredients found" });
    }

    // normalize into same shape as custom recipes
    const ingredients = data.extendedIngredients.map((ing, idx) => ({
      id: idx + 1,
      ingredient: ing.original,
      quantity: ing.amount || "",
      unit: ing.unit || "",
      isCustom: false,
    }));

    res.json({
      recipeId: recipe.id,
      recipeTitle: recipe.title,
      ingredients,
    });
  } catch (err) {
    console.error("❌ Error fetching saved recipe grocery list:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
