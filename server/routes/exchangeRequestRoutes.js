const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
    sendRequest,
    getMyRequests,
    getRequestById,
    respondToRequest,
    cancelRequest,
    completeExchange
} = require("../controllers/exchangeRequestController");

router.post("/", protect, sendRequest);
router.get("/", protect, getMyRequests);
router.get("/:id", protect, getRequestById);
router.put("/:id/respond", protect, respondToRequest);
router.put("/:id/cancel", protect, cancelRequest);
router.put("/:id/complete", protect, completeExchange);

module.exports = router;
