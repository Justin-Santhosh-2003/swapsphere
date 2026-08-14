const Review = require("../models/Review");
const ExchangeRequest = require("../models/ExchangeRequest");
const User = require("../models/User");

exports.createReview = async (req, res) => {
    try {
        const { exchangeRequestId, rating, comment } = req.body;

        if (!exchangeRequestId || !rating) {
            return res.status(400).json({
                success: false,
                message: "Exchange request ID and rating (1-5) are required."
            });
        }

        const numRating = Number(rating);
        if (numRating < 1 || numRating > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be a number between 1 and 5."
            });
        }

        const exchangeRequest = await ExchangeRequest.findById(exchangeRequestId);
        if (!exchangeRequest) {
            return res.status(404).json({
                success: false,
                message: "Exchange request not found."
            });
        }

        if (!["ACCEPTED", "COMPLETED"].includes(exchangeRequest.status)) {
            return res.status(400).json({
                success: false,
                message: "Reviews can only be posted for accepted or completed exchanges."
            });
        }

        const currentUserId = req.user.id;
        const requesterIdStr = exchangeRequest.requesterId.toString();
        const receiverIdStr = exchangeRequest.receiverId.toString();

        if (currentUserId !== requesterIdStr && currentUserId !== receiverIdStr) {
            return res.status(403).json({
                success: false,
                message: "You were not a participant in this exchange."
            });
        }

        const revieweeId = currentUserId === requesterIdStr ? receiverIdStr : requesterIdStr;

        // Check duplicate review
        const existingReview = await Review.findOne({
            exchangeRequestId,
            reviewerId: currentUserId
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: "You have already reviewed this exchange."
            });
        }

        const review = await Review.create({
            exchangeRequestId,
            reviewerId: currentUserId,
            revieweeId,
            rating: numRating,
            comment: comment || ""
        });

        // Recalculate reviewee average rating & stats
        const allReviews = await Review.find({ revieweeId });
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
        const roundedRating = Number(avgRating.toFixed(1));

        const reviewee = await User.findById(revieweeId);
        if (reviewee) {
            reviewee.averageRating = roundedRating;
            reviewee.totalCompletedExchanges = (reviewee.totalCompletedExchanges || 0) + 1;
            reviewee.exchangeSuccessRate = Math.min(100, Math.round(((reviewee.totalCompletedExchanges || 1) / ((reviewee.totalCompletedExchanges || 1) + 1)) * 100));
            await reviewee.save();
        }

        const populatedReview = await Review.findById(review._id)
            .populate("reviewerId", "fullName profilePicture")
            .populate("revieweeId", "fullName profilePicture");

        res.status(201).json({
            success: true,
            message: "Review submitted successfully.",
            review: populatedReview
        });
    } catch (error) {
        console.error("createReview error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

exports.getUserReviews = async (req, res) => {
    try {
        const { userId } = req.params;
        const reviews = await Review.find({ revieweeId: userId })
            .sort({ createdAt: -1 })
            .populate("reviewerId", "fullName profilePicture")
            .populate({
                path: "exchangeRequestId",
                populate: [
                    { path: "offeredItemId", select: "title images" },
                    { path: "requestedItemId", select: "title images" }
                ]
            });

        res.status(200).json({
            success: true,
            count: reviews.length,
            reviews
        });
    } catch (error) {
        console.error("getUserReviews error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};
