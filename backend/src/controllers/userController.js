// backend/controllers/userController.js

const db = require("../config/db");

exports.getUserHome = async (req, res) => {
  const userId = req.params.id;

  try {
    // Get username
    const [[user]] = await db.query("SELECT username FROM user WHERE id = ?", [
      userId,
    ]);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Last login (static or can be fetched from DB if tracked)
    const lastLogin = "July 25, 2025 at 9:42 AM";

    // Counts
    const [[savedCountRow]] = await db.query(
      "SELECT COUNT(*) AS count FROM savedrecipe WHERE userId = ?",
      [userId]
    );
    const [[customCountRow]] = await db.query(
      "SELECT COUNT(*) AS count FROM customrecipe WHERE userId = ?",
      [userId]
    );

    // Fetch recent saved recipes
    const [recentSaved] = await db.query(
      `SELECT id, recipeLink, dateSaved AS activityDate, 'saved' AS type
       FROM savedrecipe
       WHERE userId = ?
       ORDER BY dateSaved DESC
       LIMIT 5`,
      [userId]
    );

    // Fetch recent custom recipes
    const [recentCustom] = await db.query(
      `SELECT id, title, created_at AS activityDate, 'custom' AS type
       FROM customrecipe
       WHERE userId = ?
       ORDER BY created_at DESC
       LIMIT 5`,
      [userId]
    );

    // Merge & sort by date (newest first)
    const recent = [...recentSaved, ...recentCustom]
      .sort((a, b) => new Date(b.activityDate) - new Date(a.activityDate))
      .slice(0, 5);

    res.json({
      username: user.username,
      lastLogin,
      savedCount: savedCountRow.count,
      customCount: customCountRow.count,
      recent,
    });
  } catch (err) {
    console.error("Error fetching user home:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUserRecipes = async (req, res) => {
  const userId = req.params.id;

  try {
    // Fetch custom recipes
    const [customRecipes] = await db.query(
      `SELECT id, title, created_at FROM customrecipe WHERE userId = ? ORDER BY created_at DESC`,
      [userId]
    );

    // Fetch saved recipes
    const [savedRecipes] = await db.query(
      `SELECT id, recipeLink, starRating, dateSaved FROM savedrecipe WHERE userId = ? ORDER BY dateSaved DESC`,
      [userId]
    );

    // Merge into a single result array so frontend can loop over it
    const recipes = [
      ...customRecipes.map((r) => ({
        id: r.id,
        title: r.title,
        type: "custom",
        image: null, // you could later fetch an image column if you store one
      })),
      ...savedRecipes.map((r) => ({
        id: r.id,
        title: r.recipeLink, // OR parse from link
        type: "saved",
        image: null,
      })),
    ];

    res.json(recipes);
  } catch (err) {
    console.error("Error fetching user recipes:", err);
    res.status(500).json({ message: "Server error" });
  }
};
