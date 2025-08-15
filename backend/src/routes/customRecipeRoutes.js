const express = require("express");
const router = express.Router();
const {
  createCustomRecipe,
  getRecentCustomRecipes,
} = require("../controllers/customRecipeController");

router.post("/", createCustomRecipe); // Create a new recipe
router.get("/recent/:userId", getRecentCustomRecipes); // Get recent recipes for a user

module.exports = router;
