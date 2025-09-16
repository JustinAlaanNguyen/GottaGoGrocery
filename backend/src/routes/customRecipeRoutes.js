const express = require("express");
const router = express.Router();
const axios = require("axios");
const multer = require("multer");
const path = require("path");
const {
  createCustomRecipe,
  getRecentCustomRecipes,
  getCustomRecipeById,
  updateCustomRecipe,
  deleteCustomRecipe,
  getGroceryList,
} = require("../controllers/customRecipeController");
const multerS3 = require("multer-s3");
const { S3Client } = require("@aws-sdk/client-s3");
const { PutObjectCommand } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET,
    key: function (req, file, cb) {
      const uniqueName =
        Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        path.extname(file.originalname);
      cb(null, `recipes/${uniqueName}`);
    },
  }),
});

// --- Recipe extraction from Spoonacular ---
router.post("/extract", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "Missing recipe URL" });

  try {
    const response = await axios.get(
      "https://api.spoonacular.com/recipes/extract",
      {
        params: { apiKey: process.env.SPOONACULAR_API_KEY, url },
      }
    );

    const recipeData = response.data;

    // Save Spoonacular image into S3
    let localImageUrl = null;
    if (recipeData.image) {
      const imageResp = await axios.get(recipeData.image, {
        responseType: "arraybuffer",
      });
      const buffer = Buffer.from(imageResp.data, "binary");

      const filename = Date.now() + "-" + path.basename(recipeData.image);

      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET,
          Key: `recipes/${filename}`,
          Body: buffer,
          ContentType: "image/jpeg",
        })
      );

      localImageUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/recipes/${filename}`;
    }

    res.json({
      ...recipeData,
      image: localImageUrl || recipeData.image || null,
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
router.get("/recent/:userId", getRecentCustomRecipes);
router.get("/:id", getCustomRecipeById);
router.put("/:id", upload.single("image"), updateCustomRecipe);
router.delete("/:id", deleteCustomRecipe);
router.get("/:id/grocery-list", getGroceryList);

module.exports = router;
