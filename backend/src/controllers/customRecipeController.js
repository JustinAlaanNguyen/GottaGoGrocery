const db = require("../config/db"); // Adjust path to your DB connection

// Create a new custom recipe with ingredients, steps, and notes
exports.createCustomRecipe = async (req, res) => {
  const {
    userId,
    title,
    recipeDescription,
    serving,
    ingredients,
    steps,
    notes,
  } = req.body;

  if (!userId || !title || !ingredients || !steps) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const conn = await db.getConnection();
  await conn.beginTransaction();

  try {
    // Insert recipe
    const [recipeResult] = await conn.query(
      "INSERT INTO customrecipe (userId, title, recipeDescription, serving, notes) VALUES (?, ?, ?, ?, ?)",
      [userId, title, recipeDescription, serving, notes || null]
    );
    const custRecipId = recipeResult.insertId;

    // Insert ingredients
    for (let ing of ingredients) {
      await conn.query(
        "INSERT INTO customrecipeingredient (userId, custRecipId, ingredient, quantity) VALUES (?, ?, ?, ?)",
        [userId, custRecipId, ing.ingredient, ing.quantity]
      );
    }

    // Insert steps
    for (let i = 0; i < steps.length; i++) {
      await conn.query(
        "INSERT INTO customrecipestep (userId, custRecipId, stepNumber, description) VALUES (?, ?, ?, ?)",
        [userId, custRecipId, i + 1, steps[i]]
      );
    }

    // Optional: Store notes in recipeDescription or create a separate notes table
    // Update notes in its own column
    if (notes) {
      await conn.query("UPDATE customrecipe SET notes = ? WHERE id = ?", [
        notes,
        custRecipId,
      ]);
    }

    await conn.commit();
    res
      .status(201)
      .json({ message: "Recipe created successfully", recipeId: custRecipId });
  } catch (error) {
    await conn.rollback();
    console.error(error);
    res.status(500).json({ message: "Server error" });
  } finally {
    conn.release();
  }
};

// Get recent custom recipes for a user
exports.getRecentCustomRecipes = async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await db.query(
      "SELECT * FROM customrecipe WHERE userId = ? ORDER BY created_at DESC LIMIT 5",
      [userId]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getCustomRecipeById = async (req, res) => {
  const recipeId = req.params.id;
  try {
    const [[recipe]] = await db.query(
      "SELECT * FROM customrecipe WHERE id = ?",
      [recipeId]
    );
    if (!recipe) return res.status(404).json({ message: "Not found" });

    const [ingredients] = await db.query(
      "SELECT ingredient, quantity FROM customrecipeingredient WHERE custRecipId = ?",
      [recipeId]
    );
    const [steps] = await db.query(
      "SELECT stepNumber, description FROM customrecipestep WHERE custRecipId = ? ORDER BY stepNumber ASC",
      [recipeId]
    );

    res.json({
      title: recipe.title,
      recipeDescription: recipe.recipeDescription,
      serving: recipe.serving,
      ingredients,
      steps,
      notes: recipe.notes,
    });
  } catch (err) {
    console.error("Fetch customRecipe:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateCustomRecipe = async (req, res) => {
  const recipeId = req.params.id;
  const { title, recipeDescription, serving } = req.body;

  try {
    const [result] = await db.query(
      "UPDATE customrecipe SET title = ?, recipeDescription = ?, serving = ? WHERE id = ?",
      [title, recipeDescription, serving, recipeId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.json({ message: "Recipe updated successfully" });
  } catch (err) {
    console.error("Error updating recipe:", err);
    res.status(500).json({ message: "Server error" });
  }
};
