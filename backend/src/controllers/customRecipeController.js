const db = require("../config/db"); // Adjust path to your DB connection
const BASE_URL = process.env.BASE_URL;
const fs = require("fs");
const path = require("path");

const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

exports.createCustomRecipe = async (req, res) => {
  let { userId, title, recipeDescription, serving, ingredients, steps, notes } =
    req.body;

  // multer will attach file info
  const imageUrl = req.file
    ? req.file.location // ✅ S3 public URL
    : req.body.imageUrl || null;

  if (!userId || !title || !ingredients || !steps) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // 🚨 Parse JSON strings into arrays
  try {
    if (typeof ingredients === "string") {
      ingredients = JSON.parse(ingredients);
    }
    if (typeof steps === "string") {
      steps = JSON.parse(steps);
    }
  } catch (err) {
    console.error("Error parsing ingredients/steps:", err);
    return res
      .status(400)
      .json({ message: "Invalid ingredients or steps format" });
  }

  const conn = await db.getConnection();
  await conn.beginTransaction();

  try {
    // Insert recipe
    const [recipeResult] = await conn.query(
      "INSERT INTO customrecipe (userId, title, recipeDescription, serving, notes, imageUrl) VALUES (?, ?, ?, ?, ?, ?)",
      [userId, title, recipeDescription, serving, notes || null, imageUrl]
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

    const recipes = rows.map((r) => ({
      ...r,
      imageUrl: r.imageUrl || null,
    }));

    res.json(recipes);
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

    recipe.imageUrl = recipe.imageUrl || null;

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
      notes: recipe.notes,
      image: recipe.imageUrl, // 👈 consistent with frontend
    });
  } catch (err) {
    console.error("Fetch customRecipe:", err);
    res.status(500).json({ message: "Server error" });
  }
};
exports.updateCustomRecipe = async (req, res) => {
  const recipeId = req.params.id;
  let { title, recipeDescription, serving, ingredients, steps, notes, userId } =
    req.body;

  try {
    if (typeof ingredients === "string") ingredients = JSON.parse(ingredients);
    if (typeof steps === "string") steps = JSON.parse(steps);
  } catch (err) {
    console.error("❌ JSON parse error:", err);
    return res
      .status(400)
      .json({ message: "Invalid ingredients/steps format" });
  }

  const conn = await db.getConnection();
  await conn.beginTransaction();

  try {
    // Fetch existing recipe (to check old image)
    const [[existingRecipe]] = await conn.query(
      "SELECT imageUrl FROM customrecipe WHERE id = ?",
      [recipeId]
    );

    if (!existingRecipe) {
      await conn.rollback();
      return res.status(404).json({ message: "Recipe not found" });
    }

    let finalImageUrl = existingRecipe.imageUrl || null;

    // If new image uploaded, update & delete old one
    if (req.file) {
      finalImageUrl = req.file.location;

      if (
        existingRecipe.imageUrl &&
        existingRecipe.imageUrl.includes(process.env.AWS_S3_BUCKET)
      ) {
        try {
          const key = existingRecipe.imageUrl.split(".com/")[1];
          await s3.send(
            new DeleteObjectCommand({
              Bucket: process.env.AWS_S3_BUCKET,
              Key: key,
            })
          );
        } catch (err) {
          console.warn("⚠️ Could not delete old image from S3:", err.message);
        }
      }
    }

    // --- Update main recipe ---
    await conn.query(
      "UPDATE customrecipe SET title = ?, recipeDescription = ?, serving = ?, notes = ?, imageUrl = ? WHERE id = ?",
      [
        title,
        recipeDescription,
        serving,
        notes || null,
        finalImageUrl,
        recipeId,
      ]
    );

    // --- Sync ingredients ---
    const [existingIngredients] = await conn.query(
      "SELECT id FROM customrecipeingredient WHERE custRecipId = ?",
      [recipeId]
    );
    const incomingIngIds = (ingredients || [])
      .filter((i) => i.id)
      .map((i) => i.id);
    const existingIngIds = existingIngredients.map((i) => i.id);

    const toDeleteIng = existingIngIds.filter(
      (id) => !incomingIngIds.includes(id)
    );
    if (toDeleteIng.length > 0) {
      await conn.query("DELETE FROM customrecipeingredient WHERE id IN (?)", [
        toDeleteIng,
      ]);
    }

    for (let ing of ingredients || []) {
      if (ing.id) {
        await conn.query(
          "UPDATE customrecipeingredient SET ingredient = ?, quantity = ?, unit = ? WHERE id = ?",
          [ing.ingredient, ing.quantity, ing.unit || null, ing.id]
        );
      } else {
        await conn.query(
          "INSERT INTO customrecipeingredient (userId, custRecipId, ingredient, quantity, unit) VALUES (?, ?, ?, ?, ?)",
          [userId, recipeId, ing.ingredient, ing.quantity, ing.unit || null]
        );
      }
    }

    // --- Replace steps ---
    await conn.query("DELETE FROM customrecipestep WHERE custRecipId = ?", [
      recipeId,
    ]);
    for (let i = 0; i < (steps || []).length; i++) {
      const description =
        typeof steps[i] === "string" ? steps[i] : steps[i]?.description;
      if (!description?.trim()) continue;

      await conn.query(
        "INSERT INTO customrecipestep (userId, custRecipId, stepNumber, description) VALUES (?, ?, ?, ?)",
        [userId, recipeId, i + 1, description.trim()]
      );
    }

    await conn.commit();

    // --- Return the full updated recipe ---
    const [[recipe]] = await conn.query(
      "SELECT * FROM customrecipe WHERE id = ?",
      [recipeId]
    );
    const [ingredientsRows] = await conn.query(
      "SELECT id, ingredient, quantity, unit FROM customrecipeingredient WHERE custRecipId = ?",
      [recipeId]
    );
    const [stepsRows] = await conn.query(
      "SELECT id, stepNumber, description FROM customrecipestep WHERE custRecipId = ? ORDER BY stepNumber ASC",
      [recipeId]
    );

    res.json({
      id: recipe.id,
      title: recipe.title,
      recipeDescription: recipe.recipeDescription,
      serving: recipe.serving,
      notes: recipe.notes,
      image: recipe.imageUrl,
      ingredients: ingredientsRows,
      steps: stepsRows,
    });
  } catch (err) {
    await conn.rollback();
    console.error("❌ Error updating recipe:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  } finally {
    conn.release();
  }
};

// Delete a custom recipe// Delete a custom recipe
exports.deleteCustomRecipe = async (req, res) => {
  const recipeId = req.params.id;
  const conn = await db.getConnection();
  await conn.beginTransaction();

  try {
    // 🔎 Get recipe to check for image cleanup
    const [[recipe]] = await conn.query(
      "SELECT imageUrl FROM customrecipe WHERE id = ?",
      [recipeId]
    );

    if (!recipe) {
      await conn.rollback();
      return res.status(404).json({ message: "Recipe not found" });
    }

    // 🗑️ Delete steps
    await conn.query("DELETE FROM customrecipestep WHERE custRecipId = ?", [
      recipeId,
    ]);

    // 🗑️ Delete ingredients
    await conn.query(
      "DELETE FROM customrecipeingredient WHERE custRecipId = ?",
      [recipeId]
    );

    // 🗑️ Delete main recipe
    const [result] = await conn.query("DELETE FROM customrecipe WHERE id = ?", [
      recipeId,
    ]);

    // 🖼️ If recipe had an S3 image, delete from bucket
    if (
      recipe.imageUrl &&
      recipe.imageUrl.includes(process.env.AWS_S3_BUCKET)
    ) {
      try {
        const key = recipe.imageUrl.split(".com/")[1]; // extract "recipes/filename.jpg"
        await s3.send(
          new DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: key,
          })
        );
        console.log(`✅ Deleted S3 image: ${key}`);
      } catch (err) {
        console.warn("⚠️ Could not delete S3 image:", err.message);
        // Don’t rollback just for S3 cleanup failure
      }
    }

    await conn.commit();

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.json({ message: "Recipe and associated image deleted successfully" });
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
