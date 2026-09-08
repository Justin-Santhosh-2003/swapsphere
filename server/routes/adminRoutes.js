const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");
const {
    getStats,
    getUsers,
    toggleSuspendUser,
    toggleAdminRole,
    getListings,
    removeListing,
    restoreListing,
    getExchanges,
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
} = require("../controllers/adminController");

// All admin routes require both authentication AND admin role
router.use(protect, adminOnly);

// Stats
router.get("/stats", getStats);

// Users
router.get("/users", getUsers);
router.patch("/users/:id/suspend",    toggleSuspendUser);
router.patch("/users/:id/make-admin", toggleAdminRole);

// Listings
router.get("/listings",           getListings);
router.patch("/listings/:id/remove",  removeListing);
router.patch("/listings/:id/restore", restoreListing);

// Exchanges
router.get("/exchanges", getExchanges);

// Categories
router.get("/categories",       getCategories);
router.post("/categories",      createCategory);
router.put("/categories/:id",   updateCategory);
router.delete("/categories/:id", deleteCategory);

module.exports = router;
