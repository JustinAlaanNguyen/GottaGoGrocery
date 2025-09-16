require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const customRecipeRoutes = require("./src/routes/customRecipeRoutes");
const groceryListRoutes = require("./src/routes/groceryList");
const savedRecipeRoutes = require("./src/routes/savedRecipeRoutes");
const app = express();

// Middleware
const corsOptions = {
  origin: process.env.CLIENT_URL || "*",
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
// Serve uploaded images (static files)
app.use("/uploads", express.static("uploads"));

// Serve uploaded images (important for dev)
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/custom-recipes", customRecipeRoutes);
app.use("/api/grocery-list", groceryListRoutes);
app.use("/api/saved-recipes", savedRecipeRoutes);

app.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT NOW() AS now");
    res.send(`Backend is running! DB time: ${rows[0].now}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database connection error");
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
