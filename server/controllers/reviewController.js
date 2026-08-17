const Review = require("../models/Review");
const ExchangeRequest = require("../models/ExchangeRequest");
const ExchangeRoom = require("../models/ExchangeRoom");
const User = require("../models/User");

exports.createReview = async (req, res) => {
    try {
        const { exchangeRequestId, exchangeRoomId, rating, comment } = req.body;

        if ((!exchangeRequestId && !exchangeRoomId) || !rating) {
            return res.status(400).json({
                success: false,
                message: "An exchange ID (request or room) and a rating (1-5) are required."
            });
        }

        const numRating = Number(rating);
        if (numRating < 1 || numRating > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be a number between 1 and 5."
            });
        }

        const currentUserId = req.user.id;
        let revieweeId = req.body.revieweeId;
        let reviewRef = {}; // { exchangeRequestId } or { exchangeRoomId }

        if (exchangeRequestId) {
            // ── 2-WAY EXCHANGE REQUEST REVIEW ──────────────────────
            const exchangeRequest = await ExchangeRequest.findById(exchangeRequestId);
            if (!exchangeRequest) {
                return res.status(404).json({ success: false, message: "Exchange request not found." });
            }
            if (exchangeRequest.status !== "COMPLETED") {
                return res.status(400).json({
                    success: false,
                    message: "Reviews can only be posted after an exchange is marked as completed."
                });
            }
            const requesterIdStr = exchangeRequest.requesterId.toString();
            const receiverIdStr  = exchangeRequest.receiverId.toString();
            if (currentUserId !== requesterIdStr && currentUserId !== receiverIdStr) {
                return res.status(403).json({ success: false, message: "You were not a participant in this exchange." });
            }
            if (!revieweeId) {
                revieweeId = currentUserId === requesterIdStr ? receiverIdStr : requesterIdStr;
            }
            reviewRef = { exchangeRequestId };

        } else {
            // ── 3-WAY OR 2-WAY EXCHANGE ROOM REVIEW ───────────────
            const room = await ExchangeRoom.findById(exchangeRoomId);
            if (!room) {
                return res.status(404).json({ success: false, message: "Exchange room not found." });
            }
            if (room.status !== "COMPLETED") {
                return res.status(400).json({
                    success: false,
                    message: "Reviews can only be posted after the exchange is completed."
                });
            }
            const isParticipant = room.participants.some(
                (p) => p.userId.toString() === currentUserId
            );
            if (!isParticipant) {
                return res.status(403).json({ success: false, message: "You were not a participant in this exchange." });
            }

            if (revieweeId) {
                revieweeId = revieweeId.toString();
                const isRevieweeParticipant = room.participants.some(
                    (p) => p.userId.toString() === revieweeId
                );
                if (!isRevieweeParticipant || revieweeId === currentUserId) {
                    return res.status(400).json({ success: false, message: "Invalid participant to review." });
                }
            } else {
                // Default: in the swap ring, review the person who sent an item to currentUserId
                const itemForMe = room.items.find(
                    (i) => i.toUserId.toString() === currentUserId
                );
                if (itemForMe) {
                    revieweeId = itemForMe.fromUserId.toString();
                } else {
                    const otherPart = room.participants.find(
                        (p) => p.userId.toString() !== currentUserId
                    );
                    revieweeId = otherPart?.userId?.toString();
                }
            }
            reviewRef = { exchangeRoomId };
        }

        if (!revieweeId) {
            return res.status(400).json({ success: false, message: "Could not determine who to review." });
        }

        // Duplicate review check (by reviewer, reviewee, and exchange ref, checking linked room/request)
        let linkedReqId = exchangeRequestId ? exchangeRequestId.toString() : null;
        let linkedRoomId = exchangeRoomId ? exchangeRoomId.toString() : null;

        if (linkedReqId && !linkedRoomId) {
            const foundRoom = await ExchangeRoom.findOne({ exchangeRequestId: linkedReqId });
            if (foundRoom) linkedRoomId = foundRoom._id.toString();
        } else if (linkedRoomId && !linkedReqId) {
            const foundRoom = await ExchangeRoom.findById(linkedRoomId);
            if (foundRoom && foundRoom.exchangeRequestId) linkedReqId = foundRoom.exchangeRequestId.toString();
        }

        const idFilters = [];
        if (linkedReqId) idFilters.push({ exchangeRequestId: linkedReqId });
        if (linkedRoomId) idFilters.push({ exchangeRoomId: linkedRoomId });

        const existingReview = await Review.findOne({
            reviewerId: currentUserId,
            revieweeId: revieweeId.toString(),
            $or: idFilters
        });

        if (existingReview) {
            return res.status(400).json({ success: false, message: "You have already reviewed this user for this exchange." });
        }



        const review = await Review.create({
            exchangeRequestId: linkedReqId || exchangeRequestId || null,
            exchangeRoomId: linkedRoomId || exchangeRoomId || null,
            reviewerId: currentUserId,
            revieweeId,
            rating: numRating,
            comment: comment || ""
        });


        // Recalculate reviewee's average rating
        const allReviews = await Review.find({ revieweeId });
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
        await User.findByIdAndUpdate(revieweeId, {
            averageRating: Number(avgRating.toFixed(1)),
            exchangeSuccessRate: 100
        });

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
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

exports.getUserReviews = async (req, res) => {
    try {
        const { userId } = req.params;
        const reviews = await Review.find({ revieweeId: userId })
            .sort({ createdAt: -1 })
            .populate("reviewerId", "fullName profilePicture")
            .populate("revieweeId", "fullName profilePicture")
            .populate({
                path: "exchangeRequestId",
                populate: [
                    { path: "offeredItemId", select: "title images" },
                    { path: "requestedItemId", select: "title images" }
                ]
            })
            .populate({
                path: "exchangeRoomId",
                populate: { path: "items.itemId", select: "title images" }
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

exports.getMyGivenReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ reviewerId: req.user.id });
        res.status(200).json({
            success: true,
            count: reviews.length,
            reviews
        });
    } catch (error) {
        console.error("getMyGivenReviews error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};



