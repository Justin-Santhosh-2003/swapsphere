const Message = require("../models/Message");
const ExchangeRoom = require("../models/ExchangeRoom");
const ExchangeRequest = require("../models/ExchangeRequest");
const { createNotification } = require("../utils/notificationHelper");

// GET /api/messages/:id (supports roomId or exchangeRequestId)
exports.getMessages = async (req, res) => {
    try {
        const { exchangeRequestId: targetId } = req.params;

        // Try ExchangeRoom first
        let room = await ExchangeRoom.findById(targetId);
        let query = {};
        let isParticipant = false;

        if (room) {
            isParticipant = room.participants.some(
                (p) => p.userId.toString() === req.user.id
            );
            query = { roomId: room._id };
        } else {
            // Fallback to ExchangeRequest
            const reqDoc = await ExchangeRequest.findById(targetId);
            if (!reqDoc) {
                return res.status(404).json({
                    success: false,
                    message: "Exchange room or request not found."
                });
            }
            const requesterId = reqDoc.requesterId?._id?.toString() || reqDoc.requesterId?.toString();
            const receiverId = reqDoc.receiverId?._id?.toString() || reqDoc.receiverId?.toString();
            isParticipant = req.user.id === requesterId || req.user.id === receiverId;
            query = { $or: [{ exchangeRequestId: targetId }, { roomId: targetId }] };
        }

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: "You are not a participant in this exchange."
            });
        }

        const messages = await Message.find(query)
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

// POST /api/messages/:id (supports roomId or exchangeRequestId)
exports.sendMessage = async (req, res) => {
    try {
        const { exchangeRequestId: targetId } = req.params;
        const { text, type = "TEXT" } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({
                success: false,
                message: "Message text is required."
            });
        }

        let room = await ExchangeRoom.findById(targetId);
        let createData = {};
        let isParticipant = false;
        let isActive = false;

        if (room) {
            isParticipant = room.participants.some(
                (p) => p.userId.toString() === req.user.id
            );
            isActive = ["ACTIVE", "COMPLETED"].includes(room.status);
            createData = { roomId: room._id };
        } else {
            const reqDoc = await ExchangeRequest.findById(targetId);
            if (!reqDoc) {
                return res.status(404).json({
                    success: false,
                    message: "Exchange room or request not found."
                });
            }
            const requesterId = reqDoc.requesterId?._id?.toString() || reqDoc.requesterId?.toString();
            const receiverId = reqDoc.receiverId?._id?.toString() || reqDoc.receiverId?.toString();
            isParticipant = req.user.id === requesterId || req.user.id === receiverId;
            isActive = ["ACCEPTED", "COMPLETED"].includes(reqDoc.status);
            createData = { exchangeRequestId: reqDoc._id };
        }

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: "You are not a participant in this exchange."
            });
        }

        if (!isActive) {
            return res.status(400).json({
                success: false,
                message: "Chat is only available once the exchange is accepted/active."
            });
        }

        const message = await Message.create({
            ...createData,
            senderId: req.user.id,
            text: text.trim(),
            type: ["TEXT", "MEETING", "SYSTEM"].includes(type) ? type : "TEXT"
        });

        const populatedMessage = await Message.findById(message._id)
            .populate("senderId", "fullName profilePicture");

        // Notify the OTHER participant (not the sender)
        const senderName = populatedMessage.senderId?.fullName || "Someone";
        if (room) {
            const otherParticipant = room.participants.find(
                (p) => p.userId.toString() !== req.user.id
            );
            if (otherParticipant) {
                await createNotification(
                    otherParticipant.userId,
                    "NEW_MESSAGE",
                    `${senderName} sent you a message in your exchange room.`,
                    `/exchange-room/${room._id}`,
                    room._id
                );
            }
        } else {
            // ExchangeRequest path
            const reqDoc = await ExchangeRequest.findById(targetId);
            if (reqDoc) {
                const otherId = reqDoc.requesterId.toString() === req.user.id
                    ? reqDoc.receiverId
                    : reqDoc.requesterId;
                await createNotification(
                    otherId,
                    "NEW_MESSAGE",
                    `${senderName} sent you a message about your swap.`,
                    `/dashboard`,
                    reqDoc._id
                );
            }
        }

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
