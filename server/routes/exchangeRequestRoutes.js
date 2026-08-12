const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
    sendRequest,
    getMyRequests,
    respondToRequest,
    cancelRequest
} = require("../controllers/exchangeRequestController");

router.post("/", protect, sendRequest);
router.get("/", protect, getMyRequests);
router.put("/:id/respond", protect, respondToRequest);
router.put("/:id/cancel", protect, cancelRequest);

module.exports = router;
