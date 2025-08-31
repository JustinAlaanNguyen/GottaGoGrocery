require("dotenv").config();
const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function sendTest() {
  try {
    const message = await client.messages.create({
      body: "Hello from GottaGoGrocery 🛒! This is a test SMS.",
      from: process.env.TWILIO_PHONE_NUMBER, // your Twilio number
      to: "2263431643", // your real phone number
    });
    console.log("✅ Message sent:", message.sid);
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

sendTest();
