const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { upload } = require("../middleware/uploadMiddleware");

const {
    createItem,
    getItems,
    getMyItems,
    getItemById,
    updateItem,
    deleteItem
} = require("../controllers/itemController");

// PUBLIC ROUTES
router.get("/", getItems);

// PROTECTED ROUTES
router.get("/my-items", protect, getMyItems);
router.get("/:id", getItemById);

// CREATE ITEM WITH IMAGES
router.post("/", protect, upload.array("images", 5), createItem);

// UPDATE ITEM WITH IMAGES
router.put("/:id", protect, upload.array("images", 5), updateItem);

// DELETE ITEM
router.delete("/:id", protect, deleteItem);

module.exports = router;