const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { upload } = require("../middleware/uploadMiddleware");
const { getCurrentUser, updateProfile } = require("../controllers/userController");

router.get("/me", protect, getCurrentUser);
router.put("/me", protect, upload.single("profilePicture"), updateProfile);

module.exports = router;