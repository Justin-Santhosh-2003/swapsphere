const Item = require("../models/Item");
const Category = require("../models/Category");
const ExchangeRequest = require("../models/ExchangeRequest");
const ExchangeRoom = require("../models/ExchangeRoom");
const { uploadToCloudinary } = require("../middleware/uploadMiddleware");

async function checkItemInvolvedInExchange(itemId) {
    const item = await Item.findById(itemId);
    if (!item) return { isLocked: false };

    // 1. Item status check
    if (item.status === "PENDING" || item.status === "EXCHANGED") {
        return {
            isLocked: true,
            reason: item.status === "EXCHANGED"
                ? "Cannot edit or delete an item that has already been exchanged."
                : "Cannot edit or delete an item involved in an active exchange. Please cancel or reject the exchange first."
        };
    }

    // 2. Check 2-Way Exchange Requests (PENDING or ACCEPTED)
    const activeReq = await ExchangeRequest.findOne({
        $or: [{ offeredItemId: itemId }, { requestedItemId: itemId }],
        status: { $in: ["PENDING", "ACCEPTED"] }
    });

    if (activeReq) {
        return {
            isLocked: true,
            reason: activeReq.status === "ACCEPTED"
                ? "Cannot edit or delete an item involved in an accepted exchange."
                : "Cannot edit or delete an item tied to an active exchange request. Please cancel the exchange request first."
        };
    }

    // 3. Check Exchange Rooms (PROPOSED or ACTIVE)
    const activeRoom = await ExchangeRoom.findOne({
        "items.itemId": itemId,
        status: { $in: ["PROPOSED", "ACTIVE"] }
    });

    if (activeRoom) {
        return {
            isLocked: true,
            reason: "Cannot edit or delete an item tied to an active 3-Way or 2-Way exchange room. Please cancel or exit the exchange first."
        };
    }

    return { isLocked: false };
}


// Create Item Listing
exports.createItem = async (req, res) => {
    try {
        let {
            title,
            description,
            categoryId,
            subcategory,
            condition,
            images,
            videos,
            exchangePreferences
        } = req.body;

        if (typeof exchangePreferences === "string") {
            try { exchangePreferences = JSON.parse(exchangePreferences); } catch (e) {}
        }
        if (typeof images === "string") {
            try { images = JSON.parse(images); } catch (e) {}
        }

        if (!title || !description || !categoryId || !subcategory || !condition) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields."
            });
        }

        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found."
            });
        }

        if (!category.subcategories.includes(subcategory)) {
            return res.status(400).json({
                success: false,
                message: "Invalid subcategory for the selected category."
            });
        }

        let uploadedImages = Array.isArray(images) ? images : [];
        if (req.files && req.files.length > 0) {
            const uploadPromises = req.files.map((file) =>
                uploadToCloudinary(file.buffer, "swapsphere/items")
            );
            const urls = await Promise.all(uploadPromises);
            uploadedImages = [...uploadedImages, ...urls];
        }

        const item = await Item.create({
            ownerId: req.user.id,
            title,
            description,
            categoryId,
            subcategory,
            condition,
            images: uploadedImages,
            videos: videos || [],
            exchangePreferences: exchangePreferences || []
        });

        res.status(201).json({
            success: true,
            message: "Item listed successfully.",
            item
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// Get All Item Listings
exports.getItems = async (req, res) => {

    try {

        const {

            search,
            categoryId,

            subcategory,

            condition,
            page = 1,
            limit = 10,
            sort = "newest"

        } = req.query;

        let query = {

            status: "AVAILABLE"

        };

        // Search by title or description

        if (search) {

            query.$or = [

                {

                    title: {

                        $regex: search,
                        $options: "i"

                    }

                },

                {

                    description: {

                        $regex: search,
                        $options: "i"

                    }

                }

            ];

        }

        // Filter by category

        if (categoryId) {

            query.categoryId = categoryId;

        }
        if (subcategory) {

            query.subcategory = subcategory;

        }
        // Filter by condition

        if (condition) {

            query.condition = condition;

        }

        const pageNumber = Number(page);

        const limitNumber = Number(limit);

        const skip = (pageNumber - 1) * limitNumber;

        const totalItems = await Item.countDocuments(query);

        const totalPages = Math.ceil(totalItems / limitNumber);

        let sortOption = {

            createdAt: -1

        };

        if (sort === "oldest") {

            sortOption = {

                createdAt: 1

            };

        }

        const items = await Item.find(query)

            .sort(sortOption)

            .skip(skip)

            .limit(limitNumber)

            .populate(

                "ownerId",

                "fullName profilePicture location averageRating"

            )

            .populate(

                "categoryId",

                "name icon"

            );

        res.status(200).json({

            success: true,

            count: items.length,

            totalItems,

            currentPage: pageNumber,

            totalPages,

            items

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

// Get Single Item
exports.getItemById = async (req, res) => {

    try {

        const item = await Item.findById(req.params.id)
            .populate(
                "ownerId",
                "fullName profilePicture location averageRating totalCompletedExchanges"
            )
            .populate(
                "categoryId",
                "name icon"
            )
            .populate(
                "exchangePreferences.categoryId",
                "name"
            );

        if (!item) {

            return res.status(404).json({

                success: false,

                message: "Item not found."

            });

        }

        // Increment view count (fire and forget)
        Item.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } }).catch(() => {});

        res.status(200).json({

            success: true,

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

// Get My Item Listings
exports.getMyItems = async (req, res) => {

    try {

        const items = await Item.find({

            ownerId: req.user.id,

            status: {
                $ne: "REMOVED"
            }

        })

            .sort({
                createdAt: -1
            })

            .populate(
                "categoryId",
                "name icon"
            )

            .populate(
                "exchangePreferences.categoryId",
                "name"
            );


        res.status(200).json({

            success: true,

            count: items.length,

            items

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

// Update Item Listing
exports.updateItem = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Item not found."
            });
        }

        // Only owner or admin can update
        if (
            item.ownerId.toString() !== req.user.id &&
            req.user.role !== "ADMIN"
        ) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized."
            });
        }

        const lockCheck = await checkItemInvolvedInExchange(req.params.id);
        if (lockCheck.isLocked) {
            return res.status(400).json({
                success: false,
                message: lockCheck.reason
            });
        }



        let updateData = { ...req.body };

        if (typeof updateData.exchangePreferences === "string") {
            try { updateData.exchangePreferences = JSON.parse(updateData.exchangePreferences); } catch (e) {}
        }
        if (typeof updateData.images === "string") {
            try { updateData.images = JSON.parse(updateData.images); } catch (e) {}
        }

        if (req.files && req.files.length > 0) {
            const uploadPromises = req.files.map((file) =>
                uploadToCloudinary(file.buffer, "swapsphere/items")
            );
            const newUrls = await Promise.all(uploadPromises);
            const existingImages = Array.isArray(updateData.images) ? updateData.images : (item.images || []);
            updateData.images = [...existingImages, ...newUrls];
        }

        const updatedItem = await Item.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                returnDocument: "after",
                runValidators: true
            }
        )
            .populate("ownerId", "fullName profilePicture location averageRating")
            .populate("categoryId", "name icon");

        res.status(200).json({
            success: true,
            message: "Item updated successfully.",
            item: updatedItem
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// Delete Item Listing
exports.deleteItem = async (req, res) => {

    try {

        const item = await Item.findById(req.params.id);

        if (!item) {

            return res.status(404).json({

                success: false,
                message: "Item not found."

            });

        }

        // Only owner or admin can delete
        if (
            item.ownerId.toString() !== req.user.id &&
            req.user.role !== "ADMIN"
        ) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized."
            });
        }

        const lockCheck = await checkItemInvolvedInExchange(req.params.id);
        if (lockCheck.isLocked) {
            return res.status(400).json({
                success: false,
                message: lockCheck.reason
            });
        }



        item.status = "REMOVED";

        await item.save();

        res.status(200).json({

            success: true,
            message: "Item deleted successfully."

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