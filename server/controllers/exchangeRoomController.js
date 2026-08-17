const ExchangeRoom = require("../models/ExchangeRoom");
const Item = require("../models/Item");
const User = require("../models/User");
const ExchangeRequest = require("../models/ExchangeRequest");
const { recalculateUserStats } = require("./userController");



// Initiate 3-Way Exchange Proposal (User A initiates ring)
exports.initiateThreeWayProposal = async (req, res) => {
    try {
        const { itemAId, itemBId, itemCId } = req.body;

        if (!itemAId || !itemBId || !itemCId) {
            return res.status(400).json({
                success: false,
                message: "All 3 items in the exchange ring are required."
            });
        }

        const itemA = await Item.findById(itemAId);
        const itemB = await Item.findById(itemBId);
        const itemC = await Item.findById(itemCId);

        if (!itemA || !itemB || !itemC) {
            return res.status(404).json({
                success: false,
                message: "One or more items in the exchange ring were not found."
            });
        }

        const userAId = req.user.id;
        const userBId = itemB.ownerId.toString();
        const userCId = itemC.ownerId.toString();

        if (itemA.ownerId.toString() !== userAId) {
            return res.status(403).json({
                success: false,
                message: "You can only initiate an exchange ring using your own item."
            });
        }

        if (userAId === userBId || userBId === userCId || userAId === userCId) {
            return res.status(400).json({
                success: false,
                message: "3-Way Exchange requires 3 distinct users."
            });
        }

        if (itemA.status !== "AVAILABLE" || itemB.status !== "AVAILABLE" || itemC.status !== "AVAILABLE") {
            return res.status(400).json({
                success: false,
                message: "All items in the exchange ring must be available."
            });
        }

        // Check if an active or proposed 3-way room for these items already exists
        const existingRoom = await ExchangeRoom.findOne({
            exchangeType: "THREE_WAY",
            status: { $in: ["PROPOSED", "ACTIVE"] },
            "items.itemId": { $all: [itemAId, itemBId, itemCId] }
        });

        if (existingRoom) {
            return res.status(400).json({
                success: false,
                message: "A 3-way exchange proposal for these items is already active or pending."
            });
        }

        // Create 3-Way Exchange Room in PROPOSED status
        // Ring: A gives itemA to C, C gives itemC to B, B gives itemB to A (You)
        const room = await ExchangeRoom.create({
            exchangeType: "THREE_WAY",
            participants: [
                { userId: userAId, role: "INITIATOR", status: "ACCEPTED" },
                { userId: userBId, role: "PARTICIPANT", status: "PENDING" },
                { userId: userCId, role: "PARTICIPANT", status: "PENDING" }
            ],
            items: [
                { itemId: itemAId, fromUserId: userAId, toUserId: userCId },
                { itemId: itemBId, fromUserId: userBId, toUserId: userAId },
                { itemId: itemCId, fromUserId: userCId, toUserId: userBId }
            ],
            status: "PROPOSED"
        });

        const populatedRoom = await ExchangeRoom.findById(room._id)
            .populate("participants.userId", "fullName profilePicture email location averageRating")
            .populate({
                path: "items.itemId",
                populate: { path: "categoryId", select: "name icon" }
            });

        res.status(201).json({
            success: true,
            message: "3-Way Exchange proposal initiated! Waiting for User B & User C to accept.",
            room: populatedRoom
        });
    } catch (error) {
        console.error("initiateThreeWayProposal error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// Respond to 3-Way Proposal (Accept / Reject)
exports.respondToProposal = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // ACCEPTED or REJECTED

        if (!["ACCEPTED", "REJECTED"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be ACCEPTED or REJECTED."
            });
        }

        const room = await ExchangeRoom.findById(id);
        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Exchange room not found."
            });
        }

        const participantIndex = room.participants.findIndex(
            (p) => p.userId.toString() === req.user.id
        );

        if (participantIndex === -1) {
            return res.status(403).json({
                success: false,
                message: "You are not a participant in this exchange proposal."
            });
        }

        if (room.status !== "PROPOSED") {
            return res.status(400).json({
                success: false,
                message: `Proposal is no longer pending (current status: ${room.status}).`
            });
        }

        // Update participant approval status
        room.participants[participantIndex].status = status;

        if (status === "REJECTED") {
            room.status = "REJECTED";
            await room.save();
            return res.status(200).json({
                success: true,
                message: "Exchange proposal rejected.",
                room
            });
        }

        // Check if ALL participants have accepted
        const allAccepted = room.participants.every((p) => p.status === "ACCEPTED");

        if (allAccepted) {
            room.status = "ACTIVE";
            await room.save();

            // Lock all items to PENDING status
            const itemIds = room.items.map((i) => i.itemId);
            await Item.updateMany({ _id: { $in: itemIds } }, { status: "PENDING" });
        } else {
            await room.save();
        }

        const updatedRoom = await ExchangeRoom.findById(id)
            .populate("participants.userId", "fullName profilePicture email location averageRating")
            .populate({
                path: "items.itemId",
                populate: { path: "categoryId", select: "name icon" }
            });

        res.status(200).json({
            success: true,
            message: allAccepted
                ? "All participants accepted! The 3-Way Exchange Room is now active! 🎉"
                : "Approval recorded! Waiting for remaining participants.",
            room: updatedRoom
        });
    } catch (error) {
        console.error("respondToProposal error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// Get Room By ID (also accepts exchangeRequestId for DIRECT rooms)
exports.getRoomById = async (req, res) => {
    try {
        const { id } = req.params;

        const populateOpts = [
            { path: "participants.userId", select: "fullName profilePicture email location averageRating" },
            { path: "items.fromUserId", select: "fullName profilePicture" },
            { path: "items.toUserId",   select: "fullName profilePicture" },
            { path: "items.itemId", populate: { path: "categoryId", select: "name icon" } }
        ];

        // First try by room's own _id
        let room = await ExchangeRoom.findById(id)
            .populate(populateOpts[0])
            .populate(populateOpts[1])
            .populate(populateOpts[2])
            .populate(populateOpts[3]);

        // Fallback: find by exchangeRequestId (DIRECT 2-way rooms navigated via request ID)
        if (!room) {
            room = await ExchangeRoom.findOne({ exchangeRequestId: id })
                .populate(populateOpts[0])
                .populate(populateOpts[1])
                .populate(populateOpts[2])
                .populate(populateOpts[3]);
        }

        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Exchange room not found."
            });
        }

        const isParticipant = room.participants.some(
            (p) => p.userId._id?.toString() === req.user.id || p.userId?.toString() === req.user.id
        );

        if (!isParticipant && req.user.role !== "ADMIN") {
            return res.status(403).json({
                success: false,
                message: "You are not a participant in this exchange room."
            });
        }

        res.status(200).json({
            success: true,
            room
        });
    } catch (error) {
        console.error("getRoomById error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};


// Get My Exchange Rooms (Both Direct & 3-Way)
exports.getMyRooms = async (req, res) => {
    try {
        const rooms = await ExchangeRoom.find({
            "participants.userId": req.user.id
        })
            .sort({ updatedAt: -1 })
            .populate("participants.userId", "fullName profilePicture email location averageRating")
            .populate("items.fromUserId", "fullName profilePicture")
            .populate("items.toUserId", "fullName profilePicture")
            .populate({
                path: "items.itemId",
                populate: { path: "categoryId", select: "name icon" }
            });

        res.status(200).json({
            success: true,
            count: rooms.length,
            rooms
        });
    } catch (error) {
        console.error("getMyRooms error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// Update Meeting Details
exports.updateMeetingDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const { location, date, time } = req.body;

        const room = await ExchangeRoom.findById(id);
        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Exchange room not found."
            });
        }

        const isParticipant = room.participants.some(
            (p) => p.userId.toString() === req.user.id
        );

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: "You are not a participant in this exchange room."
            });
        }

        if (location !== undefined) room.meetingDetails.location = location;
        if (date !== undefined) room.meetingDetails.date = date;
        if (time !== undefined) room.meetingDetails.time = time;

        await room.save();

        res.status(200).json({
            success: true,
            message: "Meeting details updated successfully.",
            meetingDetails: room.meetingDetails
        });
    } catch (error) {
        console.error("updateMeetingDetails error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// Complete Room Exchange — requires ALL participants to confirm
exports.completeRoomExchange = async (req, res) => {
    try {

        const { id } = req.params;

        let room = await ExchangeRoom.findById(id);
        if (!room) {
            room = await ExchangeRoom.findOne({ exchangeRequestId: id });
        }

        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Exchange room not found."
            });
        }

        const isParticipant = room.participants.some(
            (p) => (p.userId?._id?.toString() || p.userId?.toString()) === req.user.id
        );

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: "Only participants can complete this exchange."
            });
        }

        if (room.status === "COMPLETED") {
            return res.status(200).json({
                success: true,
                message: "This exchange is already completed.",
                room,
                allConfirmed: true
            });
        }

        if (room.status !== "ACTIVE") {
            return res.status(400).json({
                success: false,
                message: "Only active exchange rooms can be completed."
            });
        }

        // Add this user to completionConfirmations if not already recorded
        const alreadyConfirmed = room.completionConfirmations.some(
            (uid) => (uid?._id?.toString() || uid?.toString()) === req.user.id
        );

        if (!alreadyConfirmed) {
            room.completionConfirmations.push(req.user.id);
        }

        const totalParticipants = room.participants.length;
        const confirmedCount = room.completionConfirmations.length;
        const allConfirmed = confirmedCount >= totalParticipants;

        if (allConfirmed) {
            // All participants have confirmed — finalise the exchange
            room.status = "COMPLETED";
            await room.save();

            // Mark all items in the room as EXCHANGED
            const itemIds = room.items.map((i) => i.itemId?._id || i.itemId);
            await Item.updateMany({ _id: { $in: itemIds } }, { status: "EXCHANGED" });

            if (room.exchangeRequestId) {
                await ExchangeRequest.findByIdAndUpdate(room.exchangeRequestId, { status: "COMPLETED" });
            }


            // Recalculate stats & increment completed exchanges for all participants immediately
            const userIds = room.participants.map((p) => p.userId?._id || p.userId);
            for (const uid of userIds) {
                await recalculateUserStats(uid);
            }

            const updatedRoom = await ExchangeRoom.findById(room._id)

                .populate("participants.userId", "fullName profilePicture email location averageRating")
                .populate({
                    path: "items.itemId",
                    populate: { path: "categoryId", select: "name icon" }
                });

            return res.status(200).json({
                success: true,
                message: "All participants confirmed! Exchange is now COMPLETED! 🎉",
                room: updatedRoom,
                allConfirmed: true,
                confirmedCount,
                totalParticipants
            });
        } else {
            // Not all confirmed yet — save and return waiting status
            await room.save();

            const updatedRoom = await ExchangeRoom.findById(room._id)
                .populate("participants.userId", "fullName profilePicture email location averageRating")
                .populate({
                    path: "items.itemId",
                    populate: { path: "categoryId", select: "name icon" }
                });

            const remaining = totalParticipants - confirmedCount;
            return res.status(200).json({
                success: true,
                message: `Your confirmation recorded! Waiting for ${remaining} other${remaining !== 1 ? "s" : ""} to confirm.`,
                room: updatedRoom,
                allConfirmed: false,
                confirmedCount,
                totalParticipants
            });
        }
    } catch (error) {
        console.error("completeRoomExchange error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// Leave / Abandon Exchange Room (Penalty applied ONLY to leaving user)
exports.leaveRoomExchange = async (req, res) => {
    try {
        const { roomId } = req.params;
        const userId = req.user.id;

        const room = await ExchangeRoom.findById(roomId);
        if (!room) {
            return res.status(404).json({ success: false, message: "Exchange room not found." });
        }

        if (room.status === "COMPLETED" || room.status === "CANCELLED") {
            return res.status(400).json({ success: false, message: "Exchange room is already finalized." });
        }

        // Mark room as CANCELLED
        room.status = "CANCELLED";
        await room.save();

        // Release all items back to AVAILABLE
        const itemIds = room.items.map((i) => i.itemId?._id || i.itemId);
        await Item.updateMany({ _id: { $in: itemIds } }, { status: "AVAILABLE" });

        // If linked 2-Way ExchangeRequest exists, mark it CANCELLED
        if (room.exchangeRequestId) {
            await ExchangeRequest.findByIdAndUpdate(room.exchangeRequestId, { status: "CANCELLED" });
        }

        // Apply penalty ONLY to the user who clicked Leave
        const user = await User.findById(userId);
        if (user) {
            user.totalCancelledExchanges = (user.totalCancelledExchanges || 0) + 1;
            await user.save();
            await recalculateUserStats(userId);
        }

        return res.status(200).json({
            success: true,
            message: "You have left the exchange room. The exchange has been cancelled and your success rate was updated.",
            room
        });
    } catch (error) {
        console.error("leaveRoomExchange error:", error);
        return res.status(500).json({
            success: false,
            message: "Server Error leaving exchange room."
        });
    }
};


