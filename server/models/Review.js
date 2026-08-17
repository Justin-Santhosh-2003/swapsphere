const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
    {
        // Either exchangeRequestId (2-way) or exchangeRoomId (3-way) must be provided
        exchangeRequestId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ExchangeRequest",
            default: null
        },
        exchangeRoomId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ExchangeRoom",
            default: null
        },
        reviewerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        revieweeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        comment: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Review", reviewSchema);
