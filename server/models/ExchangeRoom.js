const mongoose = require("mongoose");

const exchangeRoomSchema = new mongoose.Schema(
    {
        exchangeType: {
            type: String,
            enum: ["DIRECT", "THREE_WAY"],
            default: "DIRECT"
        },
        // Link to original ExchangeRequest for DIRECT 2-way swaps
        exchangeRequestId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ExchangeRequest",
            default: null
        },
        // Array of participants (2 for DIRECT, 3 for THREE_WAY)
        participants: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true
                },
                role: {
                    type: String,
                    enum: ["INITIATOR", "PARTICIPANT"],
                    default: "PARTICIPANT"
                },
                status: {
                    type: String,
                    enum: ["PENDING", "ACCEPTED", "REJECTED"],
                    default: "PENDING"
                }
            }
        ],
        // Items involved in the swap ring
        // E.g. for 3-way: A gives itemA to C, B gives itemB to A, C gives itemC to B
        items: [
            {
                itemId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Item",
                    required: true
                },
                fromUserId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true
                },
                toUserId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true
                }
            }
        ],
        meetingDetails: {
            location: { type: String, default: "" },
            date: { type: String, default: "" },
            time: { type: String, default: "" }
        },
        // Tracks which participants have confirmed completion.
        // Room becomes COMPLETED only when all participants have confirmed.
        completionConfirmations: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],
        status: {
            type: String,
            enum: ["PROPOSED", "ACTIVE", "COMPLETED", "REJECTED", "CANCELLED"],
            default: "ACTIVE"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("ExchangeRoom", exchangeRoomSchema);
