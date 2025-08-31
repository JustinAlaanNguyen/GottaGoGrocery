const bcrypt = require("bcryptjs");
const db = require("../config/db");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);
const JWT_SECRET = process.env.JWT_SECRET;

exports.signup = async (req, res) => {
  const { email, username, password } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ message: "Invalid email format." });
  }

  try {
    const [existing] = await db.query("SELECT id FROM user WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: "Email already in use." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = new Date(Date.now() + 1000 * 60 * 60); // 1h

    await db.query(
      "INSERT INTO user (email, username, passwordHash, verificationToken, verificationExpires) VALUES (?, ?, ?, ?, ?)",
      [email.trim(), username, passwordHash, verificationToken, verificationExpires]
    );

    // Send verification email
    const verificationUrl = `http://localhost:3000/account/verify?token=${verificationToken}`;

    await resend.emails.send({
      from: process.env.MAIL_FROM,
      to: email,
      subject: "Verify your GottaGoGrocery account",
      html: `
        <h2>Welcome to GottaGoGrocery! 🥦</h2>
        <p>Click below to verify your email:</p>
        <a href="${verificationUrl}" style="background:#3c5b3a;color:white;padding:10px 20px;border-radius:5px;text-decoration:none;">
          Verify Email
        </a>
        <p>This link will expire in 1 hour.</p>
      `,
    });

    res.status(201).json({ message: "Account created! Please verify your email." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

exports.signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query("SELECT * FROM user WHERE email = ?", [email.trim()]);
    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = rows[0];

    if (!user.isVerified) {
      return res.status(403).json({ error: "Please verify your email before logging in." });
    }

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


exports.verifyEmail = async (req, res) => {
  const { token } = req.body; // 👈 changed from req.query

  try {
    const [rows] = await db.query(
      "SELECT * FROM user WHERE verificationToken = ? AND verificationExpires > NOW()",
      [token]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    const user = rows[0];

    await db.query(
      "UPDATE user SET isVerified = true, verificationToken = NULL, verificationExpires = NULL WHERE id = ?",
      [user.id]
    );

    res.json({ message: "Email verified successfully! You can now sign in." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong." });
  }
};
