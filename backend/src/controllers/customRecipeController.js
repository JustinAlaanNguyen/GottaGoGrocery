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
        "INSERT INTO customrecipeingredient (userId, custRecipId, ingredient, quantity, unit) VALUES (?, ?, ?, ?, ?)",
        [userId, custRecipId, ing.ingredient, ing.quantity, ing.unit || null]
      );
    }

    // Insert steps
    for (let i = 0; i < steps.length; i++) {
      await conn.query(
        "INSERT INTO customrecipestep (userId, custRecipId, stepNumber, description) VALUES (?, ?, ?, ?)",
        [userId, custRecipId, i + 1, steps[i]]
      );
    }

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
      .json({ message: "Recipe created successfully", custRecipId });
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

    // ✅ Added "unit"
    const [ingredients] = await db.query(
      "SELECT id, ingredient, quantity, unit FROM customrecipeingredient WHERE custRecipId = ?",
      [recipeId]
    );

    const [steps] = await db.query(
      "SELECT id, stepNumber, description FROM customrecipestep WHERE custRecipId = ? ORDER BY stepNumber ASC",
      [recipeId]
    );

    res.json({
      id: recipe.id,
      title: recipe.title,
      recipeDescription: recipe.recipeDescription,
      serving: recipe.serving,
      ingredients,
      steps,
      notes: recipe.notes, // ✅ already correct
    });
  } catch (err) {
    console.error("Fetch customRecipe:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateCustomRecipe = async (req, res) => {
  const recipeId = req.params.id;
  const {
    title,
    recipeDescription,
    serving,
    ingredients,
    steps,
    notes,
    userId,
  } = req.body;

  console.log("🔹 Incoming update request:", {
    recipeId,
    title,
    recipeDescription,
    serving,
    notes,
    ingredients,
    steps,
  });

  const conn = await db.getConnection();
  await conn.beginTransaction();

  try {
    // --- RECIPE ---
    console.log("🔹 Updating main recipe...");
    const [result] = await conn.query(
      "UPDATE customrecipe SET title = ?, recipeDescription = ?, serving = ?, notes = ? WHERE id = ?",
      [title, recipeDescription, serving, notes || null, recipeId]
    );

    if (result.affectedRows === 0) {
      await conn.rollback();
      console.warn("⚠️ Recipe not found:", recipeId);
      return res.status(404).json({ message: "Recipe not found" });
    }

    // --- INGREDIENTS ---
    console.log("🔹 Syncing ingredients...");
    const [existingIngredients] = await conn.query(
      "SELECT id FROM customrecipeingredient WHERE custRecipId = ?",
      [recipeId]
    );
    const incomingIngIds = (ingredients || [])
      .filter((i) => i.id)
      .map((i) => i.id);
    const existingIngIds = existingIngredients.map((i) => i.id);

    // Delete removed
    const toDeleteIng = existingIngIds.filter(
      (id) => !incomingIngIds.includes(id)
    );
    if (toDeleteIng.length > 0) {
      console.log("   Deleting ingredients:", toDeleteIng);
      await conn.query("DELETE FROM customrecipeingredient WHERE id IN (?)", [
        toDeleteIng,
      ]);
    }

    // Insert / update ingredients
    for (let ing of ingredients || []) {
      if (ing.id) {
        console.log("   Updating ingredient:", ing);
        await conn.query(
          "UPDATE customrecipeingredient SET ingredient = ?, quantity = ?, unit = ? WHERE id = ?",
          [ing.ingredient, ing.quantity, ing.unit || null, ing.id]
        );
      } else {
        console.log("   Inserting new ingredient:", ing);
        await conn.query(
          "INSERT INTO customrecipeingredient (userId, custRecipId, ingredient, quantity, unit) VALUES (?, ?, ?, ?, ?)",
          [userId, recipeId, ing.ingredient, ing.quantity, ing.unit || null]
        );
      }
    }

    // --- STEPS (wipe & reinsert) ---
    console.log("🔹 Replacing steps...");

    // Always clear existing steps
    await conn.query("DELETE FROM customrecipestep WHERE custRecipId = ?", [
      recipeId,
    ]);

    // Re-insert from scratch with new order
    for (let i = 0; i < (steps || []).length; i++) {
      const description =
        typeof steps[i] === "string" ? steps[i] : steps[i]?.description;

      if (!description || !description.trim()) {
        console.log("   Skipping empty step at index", i);
        continue;
      }

      await conn.query(
        "INSERT INTO customrecipestep (userId, custRecipId, stepNumber, description) VALUES (?, ?, ?, ?)",
        [userId, recipeId, i + 1, description.trim()]
      );
    }

    await conn.commit();
    console.log("✅ Recipe updated successfully!");
    res.json({ message: "Recipe updated successfully" });
  } catch (err) {
    await conn.rollback();
    console.error("❌ Error updating recipe:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  } finally {
    conn.release();
  }
};

// Delete a custom recipe
exports.deleteCustomRecipe = async (req, res) => {
  const recipeId = req.params.id;
  const conn = await db.getConnection();
  await conn.beginTransaction();

  try {
    // delete steps first
    await conn.query("DELETE FROM customrecipestep WHERE custRecipId = ?", [
      recipeId,
    ]);

    // delete ingredients
    await conn.query(
      "DELETE FROM customrecipeingredient WHERE custRecipId = ?",
      [recipeId]
    );

    // delete main recipe
    const [result] = await conn.query("DELETE FROM customrecipe WHERE id = ?", [
      recipeId,
    ]);

    await conn.commit();

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.json({ message: "Recipe deleted successfully" });
  } catch (err) {
    await conn.rollback();
    console.error("❌ Error deleting recipe:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  } finally {
    conn.release();
  }
};


// Get grocery list (ingredients only) for a recipe
exports.getGroceryList = async (req, res) => {
  const recipeId = req.params.id;
  try {
    const [ingredients] = await db.query(
      "SELECT id, ingredient, quantity, unit FROM customrecipeingredient WHERE custRecipId = ?",
      [recipeId]
    );

    if (ingredients.length === 0) {
      return res.status(404).json({ message: "No ingredients found" });
    }

    res.json({ recipeId, ingredients });
  } catch (err) {
    console.error("❌ Error fetching grocery list:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
