const User = require("../models/User");
const Item = require("../models/Item");
const Category = require("../models/Category");
const ExchangeRequest = require("../models/ExchangeRequest");
const Review = require("../models/Review");
const Notification = require("../models/Notification");
const { createNotification } = require("../utils/notificationHelper");

// ─── DASHBOARD STATS ───────────────────────────────────────────────────────
exports.getStats = async (req, res) => {
    try {
        const [
            totalUsers,
            activeUsers,
            suspendedUsers,
            totalListings,
            activeListings,
            totalCategories,
            totalExchanges,
            pendingExchanges,
            completedExchanges,
            totalReviews
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ status: "ACTIVE" }),
            User.countDocuments({ status: "SUSPENDED" }),
            Item.countDocuments(),
            Item.countDocuments({ status: "AVAILABLE" }),
            Category.countDocuments(),
            ExchangeRequest.countDocuments(),
            ExchangeRequest.countDocuments({ status: "PENDING" }),
            ExchangeRequest.countDocuments({ status: "COMPLETED" }),
            Review.countDocuments()
        ]);

        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                activeUsers,
                suspendedUsers,
                totalListings,
                activeListings,
                totalCategories,
                totalExchanges,
                pendingExchanges,
                completedExchanges,
                totalReviews
            }
        });
    } catch (error) {
        console.error("Admin getStats error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// ─── USER MANAGEMENT ──────────────────────────────────────────────────────
exports.getUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 15;
        const skip = (page - 1) * limit;

        const query = {};
        if (req.query.search) {
            const regex = new RegExp(req.query.search, "i");
            query.$or = [{ fullName: regex }, { email: regex }];
        }
        if (req.query.role && req.query.role !== "ALL") {
            query.role = req.query.role;
        }
        if (req.query.status && req.query.status !== "ALL") {
            query.status = req.query.status;
        }

        const [users, total] = await Promise.all([
            User.find(query)
                .select("-password -googleId")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            User.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            users,
            total,
            page,
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error("Admin getUsers error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

exports.toggleSuspendUser = async (req, res) => {
    try {
        const targetUserId = req.params.id?.toString();
        const currentUserId = (req.user?.id || req.user?._id)?.toString();

        // Prevent admin from suspending themselves
        if (targetUserId && currentUserId && targetUserId === currentUserId) {
            return res.status(400).json({ success: false, message: "You cannot suspend your own account." });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        if (user.role === "ADMIN") {
            return res.status(403).json({ success: false, message: "Cannot suspend an admin account." });
        }

        const newStatus = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
        user.status = newStatus;
        await user.save();

        // Notify the user
        if (newStatus === "SUSPENDED") {
            await createNotification(
                user._id,
                "ACCOUNT_SUSPENDED",
                "Your account has been suspended by an administrator. Please contact support for more information.",
                null,
                null
            );
        } else {
            await createNotification(
                user._id,
                "ACCOUNT_ACTIVATED",
                "Your account has been reactivated. Welcome back to SwapSphere!",
                "/marketplace",
                null
            );
        }

        res.status(200).json({
            success: true,
            message: `User ${newStatus === "SUSPENDED" ? "suspended" : "reactivated"} successfully.`,
            user: { _id: user._id, status: newStatus }
        });
    } catch (error) {
        console.error("toggleSuspendUser error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

exports.toggleAdminRole = async (req, res) => {
    try {
        const targetUserId = req.params.id?.toString();
        const currentUserId = (req.user?.id || req.user?._id)?.toString();

        // Prevent admin from demoting/removing themselves
        if (targetUserId && currentUserId && targetUserId === currentUserId) {
            return res.status(400).json({ success: false, message: "You cannot change or remove your own admin role." });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        const newRole = user.role === "ADMIN" ? "USER" : "ADMIN";
        user.role = newRole;
        await user.save();

        res.status(200).json({
            success: true,
            message: `User role changed to ${newRole}.`,
            user: { _id: user._id, role: newRole }
        });
    } catch (error) {
        console.error("toggleAdminRole error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// ─── LISTING MANAGEMENT ───────────────────────────────────────────────────
exports.getListings = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 15;
        const skip = (page - 1) * limit;

        const query = {};
        if (req.query.status && req.query.status !== "ALL") {
            query.status = req.query.status;
        }
        if (req.query.search) {
            query.title = new RegExp(req.query.search, "i");
        }

        const [items, total] = await Promise.all([
            Item.find(query)
                .populate("ownerId", "fullName email")
                .populate("categoryId", "name")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Item.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            items,
            total,
            page,
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error("Admin getListings error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

exports.removeListing = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ success: false, message: "Item not found." });
        }

        item.status = "REMOVED";
        await item.save();

        // Notify the owner
        await createNotification(
            item.ownerId,
            "ITEM_REMOVED",
            `Your listing "${item.title}" has been removed by an administrator for violating our community guidelines.`,
            "/dashboard",
            item._id
        );

        res.status(200).json({ success: true, message: "Listing removed successfully." });
    } catch (error) {
        console.error("removeListing error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

exports.restoreListing = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ success: false, message: "Item not found." });
        }

        item.status = "AVAILABLE";
        await item.save();

        res.status(200).json({ success: true, message: "Listing restored to available." });
    } catch (error) {
        console.error("restoreListing error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// ─── EXCHANGE OVERSIGHT ───────────────────────────────────────────────────
exports.getExchanges = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 15;
        const skip = (page - 1) * limit;

        const query = {};
        if (req.query.status && req.query.status !== "ALL") {
            query.status = req.query.status;
        }

        const [exchanges, total] = await Promise.all([
            ExchangeRequest.find(query)
                .populate("requesterId", "fullName email")
                .populate("receiverId", "fullName email")
                .populate("offeredItemId", "title images")
                .populate("requestedItemId", "title images")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            ExchangeRequest.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            exchanges,
            total,
            page,
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error("Admin getExchanges error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// ─── CATEGORY MANAGEMENT ──────────────────────────────────────────────────
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 }).lean();
        res.status(200).json({ success: true, categories });
    } catch (error) {
        console.error("Admin getCategories error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const { name, icon, description, subcategories } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, message: "Category name is required." });
        }

        const existing = await Category.findOne({ name: new RegExp(`^${name}$`, "i") });
        if (existing) {
            return res.status(400).json({ success: false, message: "A category with this name already exists." });
        }

        const category = await Category.create({
            name: name.trim(),
            icon: icon || "📦",
            description: description || "",
            subcategories: Array.isArray(subcategories) ? subcategories.map(s => s.trim()).filter(Boolean) : []
        });

        res.status(201).json({ success: true, message: "Category created.", category });
    } catch (error) {
        console.error("createCategory error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { name, icon, description, subcategories } = req.body;
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found." });
        }

        if (name) category.name = name.trim();
        if (icon) category.icon = icon;
        if (description !== undefined) category.description = description;
        if (Array.isArray(subcategories)) {
            category.subcategories = subcategories.map(s => s.trim()).filter(Boolean);
        }

        await category.save();
        res.status(200).json({ success: true, message: "Category updated.", category });
    } catch (error) {
        console.error("updateCategory error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found." });
        }

        // Check if items reference this category
        const itemCount = await Item.countDocuments({ categoryId: category._id });
        if (itemCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete: ${itemCount} listing(s) are using this category.`
            });
        }

        await Category.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Category deleted successfully." });
    } catch (error) {
        console.error("deleteCategory error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};
