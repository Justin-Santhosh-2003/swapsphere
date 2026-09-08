const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        recipientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        type: {
            type: String,
            enum: [
                "EXCHANGE_REQUEST",
                "REQUEST_ACCEPTED",
                "REQUEST_REJECTED",
                "REQUEST_CANCELLED",
                "NEW_MESSAGE",
                "EXCHANGE_COMPLETED",
                "ACCOUNT_SUSPENDED",
                "ACCOUNT_ACTIVATED",
                "ITEM_REMOVED",
                "GENERAL"
            ],
            required: true
        },

        message: {
            type: String,
            required: true
        },

        link: {
            type: String,
            default: null
        },

        isRead: {
            type: Boolean,
            default: false
        },

        relatedId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null
        }
    },
    {
        timestamps: true
    }
);

// Index for fast user-specific queries
notificationSchema.index({ recipientId: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, isRead: 1 });

module.exports = mongoose.model("Notification", notificationSchema);
