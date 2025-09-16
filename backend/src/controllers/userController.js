// backend/controllers/userController.js

const db = require("../config/db");
const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const BASE_URL = process.env.BASE_URL;

exports.getUserHome = async (req, res) => {
  const userId = req.params.id;
  //console.log("getUserHome hit with id:", userId);

  try {
    // Get username + phone
    const [[user]] = await db.query(
      "SELECT username, phone, sentEmailList, sentSmsList FROM user WHERE id = ?",
      [userId]
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    // Counts
    const [[savedCountRow]] = await db.query(
      "SELECT COUNT(*) AS count FROM savedrecipe WHERE userId = ?",
      [userId]
    );
    const [[customCountRow]] = await db.query(
      "SELECT COUNT(*) AS count FROM customrecipe WHERE userId = ?",
      [userId]
    );

    // Fetch recent activity (same as before)
    const [recentSaved] = await db.query(
      `SELECT id, recipeLink, dateSaved AS activityDate, 'saved' AS type
       FROM savedrecipe
       WHERE userId = ?
       ORDER BY dateSaved DESC
       LIMIT 5`,
      [userId]
    );

    const [recentCustom] = await db.query(
      `SELECT id, title, created_at AS activityDate, 'custom' AS type
       FROM customrecipe
       WHERE userId = ?
       ORDER BY created_at DESC
       LIMIT 5`,
      [userId]
    );

    const recent = [...recentSaved, ...recentCustom]
      .sort((a, b) => new Date(b.activityDate) - new Date(a.activityDate))
      .slice(0, 5);

    // ✅ Task Completion
    const tasks = {
      addPhone: !!user.phone,
      customRecipe: customCountRow.count > 0,
      savedRecipe: savedCountRow.count > 0,
      sendEmail: !!user.sentEmailList,
      sendPhone: !!user.sentSmsList,
    };

    res.json({
      username: user.username,
      lastLogin: "July 25, 2025 at 9:42 AM", // (static for now)
      savedCount: savedCountRow.count,
      customCount: customCountRow.count,
      recent,
      tasks, // 👈 include tasks
    });
  } catch (err) {
    console.error("Error fetching user home:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUserRecipes = async (req, res) => {
  const userId = req.params.id;

  try {
    // Fetch custom recipes WITH imageUrl
    const [customRecipes] = await db.query(
      `SELECT id, title, created_at, imageUrl FROM customrecipe WHERE userId = ? ORDER BY created_at DESC`,
      [userId]
    );

    // Fetch saved recipes
    const [savedRecipes] = await db.query(
      `SELECT id, title, image, recipeLink, starRating, dateSaved 
        FROM savedrecipe 
        WHERE userId = ? 
        ORDER BY dateSaved DESC`,
      [userId]
    );

    // Merge results

    const recipes = [
      ...customRecipes.map((r) => ({
        id: r.id,
        title: r.title,
        type: "custom",
        image: r.imageUrl
          ? r.imageUrl.startsWith("http")
            ? r.imageUrl // already absolute
            : `${BASE_URL}${r.imageUrl}` // relative path, prefix it
          : null,
      })),
      ...savedRecipes.map((r) => ({
        id: r.id,
        title: r.title, // ✅ use title, not recipeLink
        type: "saved",
        image: r.image, // ✅ now returned
        link: r.recipeLink, // optional, if you want to show a "visit recipe" button
      })),
    ];

    res.json(recipes);
  } catch (err) {
    console.error("Error fetching user recipes:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get full user profile
exports.getUserProfile = async (req, res) => {
  const userId = req.params.id;
  try {
    const [[user]] = await db.query(
      "SELECT id, username, email, phone, created_at FROM user WHERE id = ?",
      [userId]
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  const userId = req.params.id;
  const { username, email, phone, password } = req.body;

  try {
    if (password) {
      // hash the new password
      const bcrypt = require("bcryptjs");
      const passwordHash = await bcrypt.hash(password, 10);
      await db.query("UPDATE user SET passwordHash = ? WHERE id = ?", [
        passwordHash,
        userId,
      ]);
    }

    if (username || email || phone) {
      await db.query(
        "UPDATE user SET username = COALESCE(?, username), email = COALESCE(?, email), phone = COALESCE(?, phone) WHERE id = ?",
        [username, email, phone, userId]
      );
    }

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Send verification code
exports.sendPhoneVerification = async (req, res) => {
  let { phone } = req.body;

  // Auto format if US/Canada 10 digits
  if (/^\d{10}$/.test(phone)) {
    phone = `+1${phone}`;
  }

  try {
    const verification = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({ to: phone, channel: "sms" });

    res.json({
      message: "Verification code sent",
      status: verification.status,
    });
  } catch (err) {
    console.error("Error sending phone verification:", err);
    res.status(500).json({ message: "Failed to send verification code" });
  }
};

// Confirm verification code
exports.confirmPhoneVerification = async (req, res) => {
  const { phone, code, userId } = req.body;
  try {
    const check = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({ to: phone, code });

    if (check.status === "approved") {
      await db.query("UPDATE user SET phone = ? WHERE id = ?", [phone, userId]);
      res.json({ message: "Phone verified & saved successfully" });
    } else {
      res.status(400).json({ message: "Invalid verification code" });
    }
  } catch (err) {
    console.error("Error confirming phone verification:", err);
    res.status(500).json({ message: "Failed to verify phone" });
  }
};
