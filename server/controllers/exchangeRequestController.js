const ExchangeRequest = require("../models/ExchangeRequest");
const Item = require("../models/Item");

// Send Exchange Request
exports.sendRequest = async (req, res) => {
    try {
        const { offeredItemId, requestedItemId, note } = req.body;

        if (!offeredItemId || !requestedItemId) {
            return res.status(400).json({
                success: false,
                message: "Offered item and requested item are required."
            });
        }

        const offeredItem = await Item.findById(offeredItemId);
        const requestedItem = await Item.findById(requestedItemId);

        if (!offeredItem || !requestedItem) {
            return res.status(404).json({
                success: false,
                message: "One or both items were not found."
            });
        }

        if (offeredItem.ownerId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You can only offer items that you own."
            });
        }

        if (requestedItem.ownerId.toString() === req.user.id) {
            return res.status(400).json({
                success: false,
                message: "You cannot request an exchange for your own item."
            });
        }

        // Check for existing pending request
        const existingRequest = await ExchangeRequest.findOne({
            offeredItemId,
            requestedItemId,
            status: "PENDING"
        });

        if (existingRequest) {
            return res.status(400).json({
                success: false,
                message: "An active exchange request for these items already exists."
            });
        }

        const request = await ExchangeRequest.create({
            requesterId: req.user.id,
            receiverId: requestedItem.ownerId,
            offeredItemId,
            requestedItemId,
            note: note || ""
        });

        // Increment exchangeRequestCount
        await Item.findByIdAndUpdate(requestedItemId, { $inc: { exchangeRequestCount: 1 } });

        const populatedRequest = await ExchangeRequest.findById(request._id)
            .populate("requesterId", "fullName profilePicture email location")
            .populate("receiverId", "fullName profilePicture email location")
            .populate("offeredItemId", "title images categoryId subcategory condition")
            .populate("requestedItemId", "title images categoryId subcategory condition");

        res.status(201).json({
            success: true,
            message: "Exchange request sent successfully.",
            request: populatedRequest
        });
    } catch (error) {
        console.error("sendRequest error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// Get My Exchange Requests (sent + received)
exports.getMyRequests = async (req, res) => {
    try {
        const { type = "all" } = req.query;

        let query = {};
        if (type === "sent") {
            query = { requesterId: req.user.id };
        } else if (type === "received") {
            query = { receiverId: req.user.id };
        } else {
            query = {
                $or: [
                    { requesterId: req.user.id },
                    { receiverId: req.user.id }
                ]
            };
        }

        const requests = await ExchangeRequest.find(query)
            .sort({ createdAt: -1 })
            .populate("requesterId", "fullName profilePicture email location averageRating")
            .populate("receiverId", "fullName profilePicture email location averageRating")
            .populate({
                path: "offeredItemId",
                populate: { path: "categoryId", select: "name icon" }
            })
            .populate({
                path: "requestedItemId",
                populate: { path: "categoryId", select: "name icon" }
            });

        res.status(200).json({
            success: true,
            count: requests.length,
            requests
        });
    } catch (error) {
        console.error("getMyRequests error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// Respond to Request (Accept / Reject)
exports.respondToRequest = async (req, res) => {
    try {
        const { status } = req.body; // ACCEPTED or REJECTED
        const { id } = req.params;

        if (!["ACCEPTED", "REJECTED"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be ACCEPTED or REJECTED."
            });
        }

        const request = await ExchangeRequest.findById(id);
        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Exchange request not found."
            });
        }

        if (request.receiverId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Only the recipient can respond to this request."
            });
        }

        if (request.status !== "PENDING") {
            return res.status(400).json({
                success: false,
                message: `Request is already ${request.status.toLowerCase()}.`
            });
        }

        request.status = status;
        await request.save();

        if (status === "ACCEPTED") {
            // Update items status to PENDING (pending exchange completion)
            await Item.findByIdAndUpdate(request.offeredItemId, { status: "PENDING" });
            await Item.findByIdAndUpdate(request.requestedItemId, { status: "PENDING" });
        }

        const updatedRequest = await ExchangeRequest.findById(id)
            .populate("requesterId", "fullName profilePicture email location")
            .populate("receiverId", "fullName profilePicture email location")
            .populate("offeredItemId", "title images categoryId subcategory condition")
            .populate("requestedItemId", "title images categoryId subcategory condition");

        res.status(200).json({
            success: true,
            message: `Exchange request ${status.toLowerCase()} successfully.`,
            request: updatedRequest
        });
    } catch (error) {
        console.error("respondToRequest error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// Cancel Request
exports.cancelRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const request = await ExchangeRequest.findById(id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Exchange request not found."
            });
        }

        if (request.requesterId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Only the requester can cancel this request."
            });
        }

        if (request.status !== "PENDING") {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel request that is ${request.status.toLowerCase()}.`
            });
        }

        request.status = "CANCELLED";
        await request.save();

        res.status(200).json({
            success: true,
            message: "Exchange request cancelled successfully."
        });
    } catch (error) {
        console.error("cancelRequest error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};
