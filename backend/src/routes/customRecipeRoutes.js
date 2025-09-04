const express = require("express");
const router = express.Router();
const {
  createCustomRecipe,
  getRecentCustomRecipes,
  getCustomRecipeById,
  updateCustomRecipe,
  deleteCustomRecipe,
  getGroceryList,
} = require("../controllers/customRecipeController");
const multer = require("multer");
const path = require("path");

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


router.post("/", upload.single("image"), createCustomRecipe);
router.get("/recent/:userId", getRecentCustomRecipes); // Get recent recipes for a user
router.get("/:id", getCustomRecipeById);
router.put("/:id", upload.single("image"), updateCustomRecipe);
router.delete("/:id", deleteCustomRecipe);
router.get("/:id/grocery-list", getGroceryList);


module.exports = router;
