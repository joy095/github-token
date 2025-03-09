const express = require("express");
const userController = require("../controllers/userController");

const router = express.Router();

// GET /github - User profile data
router.get("/", userController.getUserProfile);

module.exports = router;
