const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
    createItem,
    getItems,
    getMyItems,
    getItemById,
    updateItem,
    deleteItem
} = require("../controllers/itemController");


// =========================================
// PUBLIC ROUTES
// =========================================

router.get("/", getItems);


// =========================================
// PROTECTED ROUTES
// =========================================

// Get logged-in user's listings
// IMPORTANT: Keep this BEFORE /:id
router.get(
    "/my-items",
    protect,
    getMyItems
);


// =========================================
// ITEM BY ID
// =========================================

router.get(
    "/:id",
    getItemById
);


// =========================================
// CREATE ITEM
// =========================================

router.post(
    "/",
    protect,
    createItem
);


// =========================================
// UPDATE ITEM
// =========================================

router.put(
    "/:id",
    protect,
    updateItem
);


// =========================================
// DELETE ITEM
// =========================================

router.delete(
    "/:id",
    protect,
    deleteItem
);


module.exports = router;