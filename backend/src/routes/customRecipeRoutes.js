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

router.post("/", createCustomRecipe); // Create a new recipe
router.get("/recent/:userId", getRecentCustomRecipes); // Get recent recipes for a user
router.get("/:id", getCustomRecipeById);
router.put("/:id", updateCustomRecipe);
router.delete("/:id", deleteCustomRecipe);
router.get("/:id/grocery-list", getGroceryList);


module.exports = router;
