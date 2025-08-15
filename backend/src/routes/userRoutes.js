const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.get("/home/:id", userController.getUserHome);
router.get("/recipes/:id", userController.getUserRecipes);


module.exports = router;
