const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {

    getCurrentUser

} = require("../controllers/userController");

router.get("/me", protect, getCurrentUser);

module.exports = router;