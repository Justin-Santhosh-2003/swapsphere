const Notification = require("../models/Notification");

// ─── GET ALL NOTIFICATIONS FOR CURRENT USER ───────────────────────────────
exports.getNotifications = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [notifications, total, unreadCount] = await Promise.all([
            Notification.find({ recipientId: req.user.id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Notification.countDocuments({ recipientId: req.user.id }),
            Notification.countDocuments({ recipientId: req.user.id, isRead: false })
        ]);

        res.status(200).json({
            success: true,
            notifications,
            unreadCount,
            total,
            page,
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error("getNotifications error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// ─── GET UNREAD COUNT ONLY (lightweight poll) ─────────────────────────────
exports.getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            recipientId: req.user.id,
            isRead: false
        });
        res.status(200).json({ success: true, unreadCount: count });
    } catch (error) {
        console.error("getUnreadCount error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// ─── MARK ONE NOTIFICATION AS READ ───────────────────────────────────────
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipientId: req.user.id },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found." });
        }

        res.status(200).json({ success: true, notification });
    } catch (error) {
        console.error("markAsRead error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// ─── MARK ALL AS READ ────────────────────────────────────────────────────
exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipientId: req.user.id, isRead: false },
            { isRead: true }
        );
        res.status(200).json({ success: true, message: "All notifications marked as read." });
    } catch (error) {
        console.error("markAllAsRead error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// ─── DELETE ONE NOTIFICATION ─────────────────────────────────────────────
exports.deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            recipientId: req.user.id
        });

        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found." });
        }

        res.status(200).json({ success: true, message: "Notification deleted." });
    } catch (error) {
        console.error("deleteNotification error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// ─── CLEAR ALL NOTIFICATIONS ─────────────────────────────────────────────
exports.clearAll = async (req, res) => {
    try {
        await Notification.deleteMany({ recipientId: req.user.id });
        res.status(200).json({ success: true, message: "All notifications cleared." });
    } catch (error) {
        console.error("clearAll error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};
