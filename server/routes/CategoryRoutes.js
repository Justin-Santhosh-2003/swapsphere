const express = require("express");

const router = express.Router();

const {

    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory

} = require("../controllers/CategoryController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

router.get("/", getCategories);

router.get("/:id", getCategoryById);

router.post("/", protect, adminOnly, createCategory);

router.put("/:id", protect, adminOnly, updateCategory);

router.delete("/:id", protect, adminOnly, deleteCategory);

module.exports = router;