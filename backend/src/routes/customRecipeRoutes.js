const express = require("express");
const router = express.Router();
const axios = require("axios");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const https = require("https");
const {
  createCustomRecipe,
  getRecentCustomRecipes,
  getCustomRecipeById,
  updateCustomRecipe,
  deleteCustomRecipe,
  getGroceryList,
} = require("../controllers/customRecipeController");

// Storage engine (local filesystem for dev)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/recipes/"); // where images are saved
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// --- NEW: Recipe extraction from Spoonacular ---
router.post("/extract", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "Missing recipe URL" });

  try {
    const response = await axios.get(
      "https://api.spoonacular.com/recipes/extract",
      {
        params: {
          apiKey: process.env.SPOONACULAR_API_KEY,
          url,
        },
      }
    );

    const recipeData = response.data;

    // ✅ If Spoonacular gave an image, download & save it locally
    let localImageUrl = null;
    if (recipeData.image) {
      const filename = Date.now() + "-" + path.basename(recipeData.image);
      const uploadPath = path.join(
        __dirname,
        "../../uploads/recipes",
        filename
      );

      // Ensure uploads/recipes exists
      fs.mkdirSync(path.dirname(uploadPath), { recursive: true });

      const file = fs.createWriteStream(uploadPath);
      await new Promise((resolve, reject) => {
        https
          .get(recipeData.image, (response) => {
            response.pipe(file);
            file.on("finish", () => {
              file.close(resolve);
            });
          })
          .on("error", reject);
      });

      const serverUrl = process.env.SERVER_URL || "http://localhost:5000";
      // Build local accessible URL
      localImageUrl = `${serverUrl}/uploads/recipes/${filename}`;
    }

    res.json({
      ...recipeData,
      image: localImageUrl || recipeData.image || null, // always absolute URL
    });
  } catch (error) {
    console.error(
      "Error extracting recipe:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to extract recipe" });
  }
});

router.post("/", upload.single("image"), createCustomRecipe);
router.get("/recent/:userId", getRecentCustomRecipes); // Get recent recipes for a user
router.get("/:id", getCustomRecipeById);
router.put("/:id", upload.single("image"), updateCustomRecipe);
router.delete("/:id", deleteCustomRecipe);
router.get("/:id/grocery-list", getGroceryList);

module.exports = router;
