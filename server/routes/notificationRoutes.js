const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll
} = require("../controllers/notificationController");

// All routes require authentication
router.use(protect);

router.get("/",           getNotifications);
router.get("/unread-count", getUnreadCount);
router.patch("/read-all", markAllAsRead);
router.delete("/clear-all", clearAll);
router.patch("/:id/read", markAsRead);
router.delete("/:id",     deleteNotification);

module.exports = router;
