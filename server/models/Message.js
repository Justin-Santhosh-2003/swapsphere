const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        exchangeRequestId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ExchangeRequest",
            required: true,
            index: true
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        text: {
            type: String,
            required: true,
            trim: true
        },
        // Special message types for system/meeting events
        type: {
            type: String,
            enum: ["TEXT", "MEETING", "SYSTEM"],
            default: "TEXT"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Message", messageSchema);
