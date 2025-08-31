const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.get("/home/:id", userController.getUserHome);
router.get("/recipes/:id", userController.getUserRecipes);
router.get("/profile/:id", userController.getUserProfile);
router.put("/profile/:id", userController.updateUserProfile);

module.exports = router;
