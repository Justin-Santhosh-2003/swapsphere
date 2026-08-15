const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
    initiateThreeWayProposal,
    respondToProposal,
    getRoomById,
    getMyRooms,
    updateMeetingDetails,
    completeRoomExchange
} = require("../controllers/exchangeRoomController");

router.post("/three-way", protect, initiateThreeWayProposal);
router.get("/my-rooms", protect, getMyRooms);
router.get("/:id", protect, getRoomById);
router.put("/:id/respond", protect, respondToProposal);
router.put("/:id/meeting", protect, updateMeetingDetails);
router.put("/:id/complete", protect, completeRoomExchange);

module.exports = router;
