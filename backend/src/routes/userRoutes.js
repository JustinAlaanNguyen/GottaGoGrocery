const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.get("/home/:id", userController.getUserHome);

module.exports = router;
