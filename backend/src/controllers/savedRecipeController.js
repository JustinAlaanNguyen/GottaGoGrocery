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
