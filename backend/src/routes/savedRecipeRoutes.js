const express = require("express");
const router = express.Router();
const {
  saveRecipe,
  getSavedRecipeById,
  getSavedRecipeGroceryList,
} = require("../controllers/savedRecipeController");

// Save a Spoonacular recipe
router.post("/save", saveRecipe);
// Get a saved recipe by ID
router.get("/:id", getSavedRecipeById);
router.get("/:id/grocery-list", getSavedRecipeGroceryList);
module.exports = router;
