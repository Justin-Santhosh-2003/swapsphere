const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { getMessages, sendMessage } = require("../controllers/messageController");

router.get("/:exchangeRequestId", protect, getMessages);
router.post("/:exchangeRequestId", protect, sendMessage);

module.exports = router;
