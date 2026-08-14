const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { createReview, getUserReviews } = require("../controllers/reviewController");

router.post("/", protect, createReview);
router.get("/user/:userId", getUserReviews);

module.exports = router;
