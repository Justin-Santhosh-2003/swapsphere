const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({

    ownerId: {

        type: mongoose.Schema.Types.ObjectId,

        ref: "User",

        required: true

    },

    title: {

        type: String,

        required: true,

        trim: true

    },

    description: {

        type: String,

        required: true

    },

    categoryId: {

        type: mongoose.Schema.Types.ObjectId,

        ref: "Category",

        required: true

    },

    condition: {

        type: String,

        enum: [

            "NEW",
            "LIKE_NEW",
            "GOOD",
            "FAIR",
            "POOR"

        ],

        required: true

    },

    images: [

        {

            type: String

        }

    ],

    videos: [

        {

            type: String

        }

    ],

    exchangePreferences: [

        {

            categoryId: {

                type: mongoose.Schema.Types.ObjectId,

                ref: "Category"

            },

            subcategory: {

                type: String

            },

            priority: {

                type: Number

            }

        }

    ],

    status: {

        type: String,

        enum: [

            "AVAILABLE",
            "PENDING",
            "EXCHANGED",
            "REMOVED"

        ],

        default: "AVAILABLE"

    },

    viewCount: {

        type: Number,

        default: 0

    },

    favoriteCount: {

        type: Number,

        default: 0

    },

    exchangeRequestCount: {

        type: Number,

        default: 0

    }

},

{

    timestamps: true

});

module.exports = mongoose.model("Item", itemSchema);