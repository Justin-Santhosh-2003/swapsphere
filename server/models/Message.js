const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        roomId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ExchangeRoom",
            index: true
        },
        exchangeRequestId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ExchangeRequest",
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
