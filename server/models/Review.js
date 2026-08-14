const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
    {
        exchangeRequestId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ExchangeRequest",
            required: true
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
