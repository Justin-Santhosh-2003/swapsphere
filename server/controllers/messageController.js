const Message = require("../models/Message");
const ExchangeRequest = require("../models/ExchangeRequest");

// Helper: verify the requesting user is a participant
const isParticipant = (request, userId) => {
    const requesterId = request.requesterId?._id?.toString() || request.requesterId?.toString();
    const receiverId = request.receiverId?._id?.toString() || request.receiverId?.toString();
    return userId === requesterId || userId === receiverId;
};

// GET /api/messages/:exchangeRequestId
exports.getMessages = async (req, res) => {
    try {
        const { exchangeRequestId } = req.params;

        const exchangeRequest = await ExchangeRequest.findById(exchangeRequestId);
        if (!exchangeRequest) {
            return res.status(404).json({
                success: false,
                message: "Exchange request not found."
            });
        }

        if (!isParticipant(exchangeRequest, req.user.id)) {
            return res.status(403).json({
                success: false,
                message: "You are not a participant in this exchange."
            });
        }

        const messages = await Message.find({ exchangeRequestId })
            .sort({ createdAt: 1 })
            .populate("senderId", "fullName profilePicture");

        res.status(200).json({
            success: true,
            count: messages.length,
            messages
        });
    } catch (error) {
        console.error("getMessages error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// POST /api/messages/:exchangeRequestId
exports.sendMessage = async (req, res) => {
    try {
        const { exchangeRequestId } = req.params;
        const { text, type = "TEXT" } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({
                success: false,
                message: "Message text is required."
            });
        }

        const exchangeRequest = await ExchangeRequest.findById(exchangeRequestId);
        if (!exchangeRequest) {
            return res.status(404).json({
                success: false,
                message: "Exchange request not found."
            });
        }

        if (!isParticipant(exchangeRequest, req.user.id)) {
            return res.status(403).json({
                success: false,
                message: "You are not a participant in this exchange."
            });
        }

        if (!["ACCEPTED", "COMPLETED"].includes(exchangeRequest.status)) {
            return res.status(400).json({
                success: false,
                message: "Messages can only be sent for accepted or completed exchanges."
            });
        }

        const message = await Message.create({
            exchangeRequestId,
            senderId: req.user.id,
            text: text.trim(),
            type: ["TEXT", "MEETING", "SYSTEM"].includes(type) ? type : "TEXT"
        });

        const populatedMessage = await Message.findById(message._id)
            .populate("senderId", "fullName profilePicture");

        res.status(201).json({
            success: true,
            message: populatedMessage
        });
    } catch (error) {
        console.error("sendMessage error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};
