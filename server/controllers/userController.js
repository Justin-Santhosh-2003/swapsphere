const mongoose = require("mongoose");
const User = require("../models/User");
const Item = require("../models/Item");
const Review = require("../models/Review");
const ExchangeRoom = require("../models/ExchangeRoom");
const ExchangeRequest = require("../models/ExchangeRequest");
const { uploadToCloudinary } = require("../middleware/uploadMiddleware");

async function recalculateUserStats(userId) {
    try {
        const userObjId = typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;
        const user = await User.findById(userObjId);
        if (!user) return null;

        // 1. Calculate Average Rating from Reviews Received
        const reviews = await Review.find({ revieweeId: userObjId });
        let avgRating = 0;
        if (reviews.length > 0) {
            const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
            avgRating = Number((sum / reviews.length).toFixed(1));
        }

        // 2. Calculate Total Completed Exchanges (Rooms + Requests without double counting)
        const completedRoomsCount = await ExchangeRoom.countDocuments({
            "participants.userId": userObjId,
            status: "COMPLETED"
        });

        const roomsWithRequests = await ExchangeRoom.find({
            "participants.userId": userObjId,
            status: "COMPLETED",
            exchangeRequestId: { $ne: null }
        }).select("exchangeRequestId");

        const linkedReqIds = roomsWithRequests.map((r) => r.exchangeRequestId);

        const unlinkedCompletedRequests = await ExchangeRequest.countDocuments({
            $or: [{ requesterId: userObjId }, { receiverId: userObjId }],
            status: "COMPLETED",
            _id: { $nin: linkedReqIds }
        });

        const totalCompleted = completedRoomsCount + unlinkedCompletedRequests;
        const totalCancelled = user.totalCancelledExchanges || 0;
        const totalAttempts = totalCompleted + totalCancelled;

        let successRate = 0;
        if (totalCompleted > 0) {
            successRate = Math.round((totalCompleted / totalAttempts) * 100);
        } else {
            successRate = 0;
        }

        user.averageRating = avgRating;
        user.totalCompletedExchanges = totalCompleted;
        user.exchangeSuccessRate = successRate;
        await user.save();



        return user;
    } catch (err) {
        console.error("recalculateUserStats error:", err);
        return null;
    }
}

exports.recalculateUserStats = recalculateUserStats;


exports.getCurrentUser = async (req, res) => {
    try {
        await recalculateUserStats(req.user.id);
        const user = await User.findById(req.user.id).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { fullName, phone, bio, location } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        if (fullName) user.fullName = fullName;
        if (phone !== undefined) user.phone = phone;
        if (bio !== undefined) user.bio = bio;
        if (location) user.location = location;

        if (req.file) {
            const imageUrl = await uploadToCloudinary(req.file.buffer, "swapsphere/profiles");
            user.profilePicture = imageUrl;
        } else if (req.body.profilePicture) {
            user.profilePicture = req.body.profilePicture;
        }

        await user.save();

        const updatedUser = await User.findById(user._id).select("-password");

        res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            user: updatedUser
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// GET /users/:id — public profile (no auth required)
exports.getPublicProfile = async (req, res) => {
    try {
        const { id } = req.params;

        await recalculateUserStats(id);

        const user = await User.findById(id).select(
            "fullName profilePicture location bio averageRating totalCompletedExchanges exchangeSuccessRate createdAt"
        );

        if (!user || user.status === "SUSPENDED") {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        const [items, reviews] = await Promise.all([
            Item.find({ ownerId: id, status: "AVAILABLE" })
                .select("title images categoryId subcategory condition createdAt")
                .populate("categoryId", "name icon")
                .sort({ createdAt: -1 })
                .limit(12),
            Review.find({ revieweeId: id })
                .sort({ createdAt: -1 })
                .limit(10)
                .populate("reviewerId", "fullName profilePicture")
                .populate({
                    path: "exchangeRequestId",
                    populate: [
                        { path: "offeredItemId", select: "title" },
                        { path: "requestedItemId", select: "title" }
                    ]
                })
                .populate({
                    path: "exchangeRoomId",
                    populate: { path: "items.itemId", select: "title" }
                })
        ]);

        res.status(200).json({
            success: true,
            user,
            items,
            reviews
        });
    } catch (error) {
        console.error("getPublicProfile error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};