const Item = require("../models/Item");

// Create Item Listing
exports.createItem = async (req, res) => {

    try {

        const {

            title,
            description,
            categoryId,
            condition,
            images,
            videos,
            exchangePreferences

        } = req.body;

        if (

            !title ||
            !description ||
            !categoryId ||
            !condition

        ) {

            return res.status(400).json({

                success: false,
                message: "Please fill all required fields."

            });

        }

        const item = await Item.create({

            ownerId: req.user.id,

            title,

            description,

            categoryId,

            condition,

            images: images || [],

            videos: videos || [],

            exchangePreferences: exchangePreferences || []

        });

        res.status(201).json({

            success: true,

            message: "Item listed successfully.",

            item

        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: "Server Error"

        });

    }

};