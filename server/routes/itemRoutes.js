const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {

    createItem,
    getItems,
    getItemById,
    updateItem,
    deleteItem

} = require("../controllers/itemController");

// Public Routes

router.get("/", getItems);

router.get("/:id", getItemById);

// Protected Routes

router.post("/", protect, createItem);

router.put("/:id", protect, updateItem);

router.delete("/:id", protect, deleteItem);

module.exports = router;