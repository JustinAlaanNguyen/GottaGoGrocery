// routes/groceryList.js
const express = require("express");
const router = express.Router();
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);
const db = require("../config/db"); // your DB helper (same pattern as your other controllers)
const twilio = require("twilio");
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

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

function normalizeForSms(text = "") {
  return text
    .replace(/•/g, "-") // replace bullets with dashes
    .replace(/½/g, "1/2") // replace ½ with 1/2
    .replace(/¼/g, "1/4")
    .replace(/¾/g, "3/4")
    .replace(/\bkg lb\b/g, "kg")
    .replace(/\bg lb\b/g, "lb")
    .replace(/[ \t]+/g, " ") // collapse spaces/tabs only
    .trim();
}

router.post("/email", async (req, res) => {
  try {
    const { userId, recipeId, recipeTitle, items } = req.body;

    if (!userId || !Array.isArray(items)) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    // get user (server side) to be safe — don't rely on client-provided email
    const [[userRow]] = await db.query(
      "SELECT id, email, username FROM user WHERE id = ?",
      [userId]
    );
    if (!userRow || !userRow.email) {
      return res
        .status(404)
        .json({ error: "User not found or no email on file." });
    }

    const toEmail = userRow.email;
    const safeTitle = escapeHtml(recipeTitle || "Your grocery list");

    // Build HTML body
    const htmlItems = items
      .map((it) => {
        const qty = escapeHtml(it.quantity || "");
        const unit = escapeHtml(it.unit || "");
        const name = escapeHtml(it.ingredient || "");
        const note = it.note
          ? `<em style="color:#e07a2b"> (${escapeHtml(it.note)})</em>`
          : "";
        const customBadge = it.isCustom
          ? `<strong style="color:#b06b00"> [custom]</strong>`
          : "";
        return `<li style="margin-bottom:8px">${qty} ${unit} <strong>${name}</strong>${customBadge}${note}</li>`;
      })
      .join("");

    const html = `
      <div style="font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color:#222;">
        <h2 style="color:#344e41">${escapeHtml(
          "GottaGoGrocery"
        )} — ${safeTitle}</h2>
        <p>Hi ${escapeHtml(userRow.username || "there")},</p>
        <p>Here is the list of items you still need:</p>
        <ul style="padding-left:18px; color:#111">${htmlItems}</ul>
        <p style="color:#666; font-size:14px; margin-top:12px;">Sent from GottaGoGrocery</p>
      </div>
    `;

    const text = [
      `${recipeTitle || "Grocery List"}`,
      "",
      ...items.map((it) => {
        const qty = it.quantity ? `${it.quantity} ` : "";
        const unit = it.unit ? `${it.unit} ` : "";
        const note = it.note ? ` (${it.note})` : "";
        const custom = it.isCustom ? " [custom]" : "";
        return `- ${qty}${unit}${it.ingredient}${custom}${note}`;
      }),
    ].join("\n");

    // send via Resend SDK
    await resend.emails.send({
      from: process.env.MAIL_FROM,
      to: toEmail,
      subject: `Grocery List${recipeTitle ? ` — ${recipeTitle}` : ""}`,
      html,
      text,
    });
    await db.query("UPDATE user SET sentEmailList = 1 WHERE id = ?", [userId]);
    return res.json({ ok: true, message: "Email sent" });
  } catch (err) {
    console.error("Error sending grocery list email:", err);
    return res.status(500).json({ error: "Failed to send email" });
  }
});

function splitMessage(msg, chunkSize = 600) {
  const parts = [];
  for (let i = 0; i < msg.length; i += chunkSize) {
    parts.push(msg.substring(i, i + chunkSize));
  }
  return parts;
}

// send grocery list via SMS
router.post("/sms", async (req, res) => {
  const { userId, recipeTitle, items } = req.body;

  try {
    console.log("📩 Incoming SMS request:", {
      userId,
      recipeTitle,
      itemsCount: items?.length,
    });

    // fetch user's phone number
    const [rows] = await db.query("SELECT phone FROM user WHERE id = ?", [
      userId,
    ]);
    if (rows.length === 0 || !rows[0].phone) {
      console.warn("⚠️ No phone number found for user:", userId);
      return res.json({ ok: false, error: "No phone number on account" });
    }

    const phone = rows[0].phone;
    console.log("✅ Found phone:", phone);

    // format the grocery list
    const listText = items
      .map((i) => {
        // trust frontend to format properly
        const baseIngredient = normalizeForSms(i.ingredient || "");
        const note = i.note ? ` (${normalizeForSms(i.note)})` : "";
        return `- ${baseIngredient}${note}`;
      })
      .join("\n");

    const message = normalizeForSms(
      `Grocery List for ${recipeTitle}\n\nStill Needed:\n${listText}`
    );

    console.log("📝 SMS message body:\n", message);

    // split into safe chunks if needed
    const parts = splitMessage(message);
    const results = [];

    for (const [index, part] of parts.entries()) {
      const twilioResp = await client.messages.create({
        body:
          parts.length > 1 ? `(${index + 1}/${parts.length})\n${part}` : part,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone,
      });
      results.push({
        sid: twilioResp.sid,
        status: twilioResp.status,
        index: index + 1,
      });
    }

    await db.query("UPDATE user SET sentSmsList = 1 WHERE id = ?", [userId]);

    // ✅ only respond once
    res.json({ ok: true, messages: results });
  } catch (err) {
    console.error("❌ Error sending SMS:", err);
    res.json({ ok: false, error: err.message });
  }
});

module.exports = router;
