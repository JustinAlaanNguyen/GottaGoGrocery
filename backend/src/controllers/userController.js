const db = require("../config/db");

exports.getUserHome = async (req, res) => {
  const userId = req.params.id;

  try {
    const [[user]] = await db.query("SELECT username FROM user WHERE id = ?", [userId]);
    if (!user) return res.status(404).json({ message: "User not found" });

    // For demo, last login is static or retrieved from a separate table/column
    const lastLogin = "July 25, 2025 at 9:42 AM";

    const [[savedCountRow]] = await db.query("SELECT COUNT(*) AS count FROM savedrecipe WHERE userId = ?", [userId]);
    const [[customCountRow]] = await db.query("SELECT COUNT(*) AS count FROM customrecipe WHERE userId = ?", [userId]);

    const [recentSaved] = await db.query(
      "SELECT id, recipeLink, dateSaved FROM savedrecipe WHERE userId = ? ORDER BY dateSaved DESC LIMIT 3",
      [userId]
    );
    const [recentCustom] = await db.query(
      "SELECT id, title, created_at FROM customrecipe WHERE userId = ? ORDER BY created_at DESC LIMIT 3",
      [userId]
    );

    // Combine both for recent activity (simple merge)
    const recent = [
      ...recentSaved.map((r) => ({
        id: r.id,
        recipeLink: r.recipeLink,
        dateSaved: r.dateSaved,
      })),
      ...recentCustom.map((c) => ({
        id: c.id,
        title: c.title,
        created_at: c.created_at,
      })),
    ].slice(0, 5);

    res.json({
      username: user.username,
      lastLogin,
      savedCount: savedCountRow.count,
      customCount: customCountRow.count,
      recent,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
