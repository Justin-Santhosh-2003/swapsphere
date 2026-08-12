const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { getSuggestions } = require("../controllers/suggestionController");

router.get("/", protect, getSuggestions);

module.exports = router;
