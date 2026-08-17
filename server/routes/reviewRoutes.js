const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { createReview, getUserReviews, getMyGivenReviews } = require("../controllers/reviewController");

router.post("/", protect, createReview);
router.get("/given/me", protect, getMyGivenReviews);
router.get("/user/:userId", getUserReviews);

module.exports = router;

