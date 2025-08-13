const bcrypt = require("bcryptjs");
const db = require("../config/db");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

exports.signup = async (req, res) => {
  const { email, username, password } = req.body;

  // Extra backend validation
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ message: "Invalid email format." });
  }

  try {
    const [existing] = await db.query("SELECT id FROM user WHERE email = ?", [
      email,
    ]);
    if (existing.length > 0) {
      return res.status(400).json({ message: "Email already in use." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO user (email, username, passwordHash) VALUES (?, ?, ?)",
      [email.trim(), username, passwordHash]
    );

    res.status(201).json({ message: "Account created successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

exports.signin = async (req, res) => {
  const { email, password } = req.body;

  // Extra backend validation
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ error: "Invalid email format." });
  }

  try {
    const [rows] = await db.query("SELECT * FROM user WHERE email = ?", [
      email.trim(),
    ]);
    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = rows[0];
    // console.log("User from DB:", user);
    // console.log("Submitted password:", password);

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "2h",
    });

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.username },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
