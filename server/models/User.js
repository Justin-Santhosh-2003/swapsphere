const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
    fullName: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    password: {
        type: String,
        default: null
    },

    googleId: {
        type: String,
        default: null
    },

    profilePicture: {
        type: String,
        default: ""
    },

    phone: {
        type: String,
        default: null
    },

    bio: {
        type: String,
        default: ""
    },

    location: {
        type: String,
        required: true
    },

    totalCompletedExchanges: {
        type: Number,
        default: 0
    },

    averageRating: {
        type: Number,
        default: 0
    },

    exchangeSuccessRate: {
        type: Number,
        default: 0
    },

    role: {
        type: String,
        enum: ["USER", "ADMIN"],
        default: "USER"
    },

    status: {
        type: String,
        enum: ["ACTIVE", "SUSPENDED"],
        default: "ACTIVE"
    }

},
{
    timestamps: true
});

module.exports = mongoose.model("User", userSchema);