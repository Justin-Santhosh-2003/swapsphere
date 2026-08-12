const mongoose = require("mongoose");

const exchangeRequestSchema = new mongoose.Schema(
    {
        requesterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        offeredItemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item",
            required: true
        },
        requestedItemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item",
            required: true
        },
        status: {
            type: String,
            enum: ["PENDING", "ACCEPTED", "REJECTED", "COMPLETED", "CANCELLED"],
            default: "PENDING"
        },
        note: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("ExchangeRequest", exchangeRequestSchema);
