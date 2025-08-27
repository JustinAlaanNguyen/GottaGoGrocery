// routes/groceryList.js
const express = require("express");
const router = express.Router();
const {Resend} = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);
const db = require("../config/db"); // your DB helper (same pattern as your other controllers)

// small utility to escape HTML
function escapeHtml(s = "") {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * POST /api/grocery-list/email
 * Body: {
 *   userId,           // required (server validates)
 *   recipeId,         // optional but useful to log
 *   recipeTitle,      // optional friendly title
 *   items: [{ ingredient, quantity, unit, note, isCustom }]
 * }
 */
router.post("/email", async (req, res) => {
  try {
    const { userId, recipeId, recipeTitle, items } = req.body;

    if (!userId || !Array.isArray(items)) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    // get user (server side) to be safe — don't rely on client-provided email
    const [[userRow]] = await db.query("SELECT id, email, username FROM user WHERE id = ?", [userId]);
    if (!userRow || !userRow.email) {
      return res.status(404).json({ error: "User not found or no email on file." });
    }

    const toEmail = userRow.email;
    const safeTitle = escapeHtml(recipeTitle || "Your grocery list");

    // Build HTML body
    const htmlItems = items.map(it => {
      const qty = escapeHtml(it.quantity || "");
      const unit = escapeHtml(it.unit || "");
      const name = escapeHtml(it.ingredient || "");
      const note = it.note ? `<em style="color:#e07a2b"> (${escapeHtml(it.note)})</em>` : "";
      const customBadge = it.isCustom ? `<strong style="color:#b06b00"> [custom]</strong>` : "";
      return `<li style="margin-bottom:8px">${qty} ${unit} <strong>${name}</strong>${customBadge}${note}</li>`;
    }).join("");

    const html = `
      <div style="font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color:#222;">
        <h2 style="color:#344e41">${escapeHtml("GottaGoGrocery")} — ${safeTitle}</h2>
        <p>Hi ${escapeHtml(userRow.username || "there")},</p>
        <p>Here is the list of items you still need:</p>
        <ul style="padding-left:18px; color:#111">${htmlItems}</ul>
        <p style="color:#666; font-size:14px; margin-top:12px;">Sent from GottaGoGrocery</p>
      </div>
    `;

    const text = [
      `${recipeTitle || "Grocery List"}`,
      "",
      ...items.map(it => {
        const qty = it.quantity ? `${it.quantity} ` : "";
        const unit = it.unit ? `${it.unit} ` : "";
        const note = it.note ? ` (${it.note})` : "";
        const custom = it.isCustom ? " [custom]" : "";
        return `- ${qty}${unit}${it.ingredient}${custom}${note}`;
      })
    ].join("\n");

    // send via Resend SDK
    await resend.emails.send({
      from: process.env.MAIL_FROM,
      to: toEmail,
      subject: `Grocery List${recipeTitle ? ` — ${recipeTitle}` : ""}`,
      html,
      text,
    });

    return res.json({ ok: true, message: "Email sent" });
  } catch (err) {
    console.error("Error sending grocery list email:", err);
    return res.status(500).json({ error: "Failed to send email" });
  }
});

module.exports = router;
