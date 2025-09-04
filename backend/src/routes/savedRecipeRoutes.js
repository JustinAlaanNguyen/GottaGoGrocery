const express = require("express");
const router = express.Router();
const {
  saveRecipe,
  getSavedRecipeById,
} = require("../controllers/savedRecipeController");

// Save a Spoonacular recipe
router.post("/save", saveRecipe);
// Get a saved recipe by ID
router.get("/:id", getSavedRecipeById);
module.exports = router;
