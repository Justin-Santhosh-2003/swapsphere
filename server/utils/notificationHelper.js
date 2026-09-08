const Notification = require("../models/Notification");

/**
 * Creates a notification for a given recipient.
 *
 * @param {string|ObjectId} recipientId - The user to notify
 * @param {string} type - One of the Notification type enum values
 * @param {string} message - Human-readable notification message
 * @param {string|null} link - Optional frontend route link (e.g. "/exchange-room/abc123")
 * @param {string|ObjectId|null} relatedId - Optional reference to triggering document
 */
const createNotification = async (
    recipientId,
    type,
    message,
    link = null,
    relatedId = null
) => {
    try {
        await Notification.create({
            recipientId,
            type,
            message,
            link,
            relatedId
        });
    } catch (error) {
        // Notifications are non-critical — log but don't crash the request
        console.error("Failed to create notification:", error.message);
    }
};

module.exports = { createNotification };
