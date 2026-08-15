import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getExchangeRequestById, completeExchangeRequest } from "../api/exchangeRequestApi";
import {
    getExchangeRoomById,
    respondToThreeWayProposal,
    updateMeetingDetails as saveMeetingDetails,
    completeRoomExchange
} from "../api/exchangeRoomApi";
import { getMessages, sendMessage } from "../api/messageApi";
import { createReview } from "../api/reviewApi";
import "./ExchangeRoom.css";

const POLL_INTERVAL = 5000;

const statusColors = {
    ACTIVE: "status-accepted",
    ACCEPTED: "status-accepted",
    COMPLETED: "status-completed",
    PROPOSED: "status-pending",
    PENDING: "status-pending",
    CANCELLED: "status-cancelled",
    REJECTED: "status-rejected"
};

const statusLabels = {
    ACTIVE: "Active Group Room",
    ACCEPTED: "In Progress",
    COMPLETED: "Completed",
    PROPOSED: "Pending Approvals",
    PENDING: "Pending",
    CANCELLED: "Cancelled",
    REJECTED: "Rejected"
};

export default function ExchangeRoom() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [room, setRoom] = useState(null); // ExchangeRoom object if available
    const [exchange, setExchange] = useState(null); // Fallback ExchangeRequest
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionError, setActionError] = useState("");
    const [actionSuccess, setActionSuccess] = useState("");

    // Meeting panel
    const [meetingLocation, setMeetingLocation] = useState("");
    const [meetingDate, setMeetingDate] = useState("");
    const [meetingTime, setMeetingTime] = useState("");
    const [savingMeeting, setSavingMeeting] = useState(false);

    // Complete exchange
    const [completing, setCompleting] = useState(false);
    const [showCompleteModal, setShowCompleteModal] = useState(false);

    // Proposal response (for 3-way)
    const [responding, setResponding] = useState(false);

    // Review panel
    const [showReviewPanel, setShowReviewPanel] = useState(false);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewDone, setReviewDone] = useState(false);

    const messagesContainerRef = useRef(null);
    const pollingRef = useRef(null);
    const isNearBottomRef = useRef(true);
    const isInitialLoadRef = useRef(true);

    const myId = user?._id?.toString() || user?.id?.toString();

    // ─── Load Room or Exchange ───────────────────────────────────
    const loadExchangeData = useCallback(async () => {
        try {
            // First try loading as ExchangeRoom
            try {
                const roomRes = await getExchangeRoomById(id);
                if (roomRes.data.room) {
                    setRoom(roomRes.data.room);
                    if (roomRes.data.room.meetingDetails) {
                        setMeetingLocation(roomRes.data.room.meetingDetails.location || "");
                        setMeetingDate(roomRes.data.room.meetingDetails.date || "");
                        setMeetingTime(roomRes.data.room.meetingDetails.time || "");
                    }
                    setLoading(false);
                    return;
                }
            } catch {
                // Fallback to ExchangeRequest if room not found
            }

            const reqRes = await getExchangeRequestById(id);
            const req = reqRes.data.request;
            const requesterId = req.requesterId?._id?.toString() || req.requesterId?.toString();
            const receiverId = req.receiverId?._id?.toString() || req.receiverId?.toString();

            if (myId !== requesterId && myId !== receiverId) {
                navigate("/dashboard");
                return;
            }
            setExchange(req);
        } catch (err) {
            if (err.response?.status === 403) {
                navigate("/dashboard");
            } else {
                setError(err.response?.data?.message || "Failed to load exchange room.");
            }
        } finally {
            setLoading(false);
        }
    }, [id, myId, navigate]);

    // ─── Load Messages ───────────────────────────────────────────
    const loadMessages = useCallback(async () => {
        try {
            const res = await getMessages(id);
            const fetchedMsgs = res.data.messages || [];

            setMessages((prev) => {
                if (prev.length === fetchedMsgs.length) {
                    const prevLast = prev[prev.length - 1]?._id;
                    const fetchedLast = fetchedMsgs[fetchedMsgs.length - 1]?._id;
                    if (prevLast === fetchedLast) return prev;
                }
                return fetchedMsgs;
            });
        } catch {
            // Silently fail polling attempts
        }
    }, [id]);

    useEffect(() => {
        loadExchangeData();
    }, [loadExchangeData]);

    const activeStatus = room ? room.status : exchange?.status;
    const canChat = ["ACTIVE", "ACCEPTED", "COMPLETED"].includes(activeStatus);

    useEffect(() => {
        if (!canChat) return;

        loadMessages();
        pollingRef.current = setInterval(loadMessages, POLL_INTERVAL);

        return () => clearInterval(pollingRef.current);
    }, [canChat, loadMessages]);

    // Auto-scroll chat box
    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container || messages.length === 0) return;

        if (isInitialLoadRef.current) {
            container.scrollTop = container.scrollHeight;
            isInitialLoadRef.current = false;
        } else if (isNearBottomRef.current) {
            container.scrollTo({
                top: container.scrollHeight,
                behavior: "smooth"
            });
        }
    }, [messages]);

    const handleMessagesScroll = () => {
        const container = messagesContainerRef.current;
        if (!container) return;
        const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
        isNearBottomRef.current = distanceFromBottom < 60;
    };

    // ─── Send Chat Message ────────────────────────────────────────
    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        setSending(true);
        try {
            await sendMessage(id, newMessage.trim());
            setNewMessage("");
            isNearBottomRef.current = true;
            await loadMessages();
        } catch (err) {
            setActionError(err.response?.data?.message || "Failed to send message.");
        } finally {
            setSending(false);
        }
    };

    // ─── Respond to 3-Way Proposal ───────────────────────────────
    const handleProposalResponse = async (status) => {
        if (!room) return;
        setResponding(true);
        setActionError("");
        try {
            const res = await respondToThreeWayProposal(room._id, status);
            setActionSuccess(res.data.message);
            await loadExchangeData();
        } catch (err) {
            setActionError(err.response?.data?.message || "Failed to respond to proposal.");
        } finally {
            setResponding(false);
        }
    };

    // ─── Save Meeting Details ─────────────────────────────────────
    const handleSaveMeeting = async (e) => {
        e.preventDefault();
        setSavingMeeting(true);
        setActionError("");
        try {
            if (room) {
                await saveMeetingDetails(room._id, {
                    location: meetingLocation,
                    date: meetingDate,
                    time: meetingTime
                });
            }
            // Send a meeting notification message to chat as well
            const parts = [];
            if (meetingLocation) parts.push(`📍 Location: ${meetingLocation}`);
            if (meetingDate) parts.push(`📅 Date: ${meetingDate}`);
            if (meetingTime) parts.push(`⏰ Time: ${meetingTime}`);
            if (parts.length > 0) {
                await sendMessage(id, parts.join(" | "), "MEETING");
                await loadMessages();
            }
            setActionSuccess("Meeting details saved!");
        } catch (err) {
            setActionError(err.response?.data?.message || "Failed to save meeting details.");
        } finally {
            setSavingMeeting(false);
        }
    };

    // ─── Complete Exchange ────────────────────────────────────────
    const handleComplete = async () => {
        setCompleting(true);
        setActionError("");
        try {
            if (room) {
                await completeRoomExchange(room._id);
            } else {
                await completeExchangeRequest(id);
            }
            setShowCompleteModal(false);
            setActionSuccess("🎉 Exchange completed! All items have been marked as exchanged.");
            setShowReviewPanel(true);
            await loadExchangeData();
        } catch (err) {
            setActionError(err.response?.data?.message || "Failed to complete exchange.");
        } finally {
            setCompleting(false);
        }
    };

    // ─── Submit Review ────────────────────────────────────────────
    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setSubmittingReview(true);
        setActionError("");
        try {
            await createReview({ exchangeRequestId: id, rating: reviewRating, comment: reviewComment });
            setReviewDone(true);
            setActionSuccess("⭐ Review submitted! Thank you for your feedback.");
        } catch (err) {
            setActionError(err.response?.data?.message || "Failed to submit review.");
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) {
        return (
            <section className="er-section">
                <div className="er-loading">
                    <div className="er-spinner" />
                    <p>Loading exchange room...</p>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="er-section">
                <div className="er-error-state">
                    <span className="er-error-icon">⚠️</span>
                    <h3>{error}</h3>
                    <Link to="/dashboard" className="er-btn er-btn-outline">Back to Dashboard</Link>
                </div>
            </section>
        );
    }

    const currentStatus = room ? room.status : exchange?.status;
    const isThreeWay = room?.exchangeType === "THREE_WAY";
    const isCompleted = currentStatus === "COMPLETED";
    const isActive = currentStatus === "ACTIVE" || currentStatus === "ACCEPTED";
    const isProposed = currentStatus === "PROPOSED";

    // 3-Way approval stats
    const myParticipant = room?.participants?.find(
        (p) => p.userId?._id?.toString() === myId || p.userId?.toString() === myId
    );
    const acceptedCount = room?.participants?.filter((p) => p.status === "ACCEPTED").length || 0;
    const totalParticipants = room?.participants?.length || 2;
    const isPendingMyApproval = isProposed && myParticipant?.status === "PENDING";

    // 2-Way helper objects
    const myItem = exchange ? (
        (exchange.requesterId?._id?.toString() || exchange.requesterId?.toString()) === myId
            ? exchange.offeredItemId
            : exchange.requestedItemId
    ) : null;

    const theirItem = exchange ? (
        (exchange.requesterId?._id?.toString() || exchange.requesterId?.toString()) === myId
            ? exchange.requestedItemId
            : exchange.offeredItemId
    ) : null;

    const otherUser = exchange ? (
        (exchange.requesterId?._id?.toString() || exchange.requesterId?.toString()) === myId
            ? exchange.receiverId
            : exchange.requesterId
    ) : null;

    const formatDate = (date) => new Date(date).toLocaleDateString([], { month: "short", day: "numeric" });
    const formatTime = (date) => new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    return (
        <section className="er-section">
            <div className="er-container">

                {/* ── HEADER ────────────────────────────────────────── */}
                <div className="er-header">
                    <div className="er-header-top">
                        <Link to="/dashboard" className="er-back-btn">
                            ← Dashboard
                        </Link>
                        <div className="d-flex align-items-center gap-2">
                            {isThreeWay && (
                                <span className="badge bg-primary px-3 py-1 rounded-pill fw-bold">
                                    🔄 3-WAY RING ({acceptedCount}/{totalParticipants} ACCEPTED)
                                </span>
                            )}
                            <span className={`er-status-badge ${statusColors[currentStatus] || ""}`}>
                                {statusLabels[currentStatus] || currentStatus}
                            </span>
                        </div>
                    </div>

                    <h1 className="er-title">
                        {isThreeWay ? "3-Way Group Exchange Room" : `${myItem?.title || "Item"} ⇄ ${theirItem?.title || "Item"}`}
                    </h1>
                    <p className="er-subtitle">
                        {isThreeWay
                            ? `Group exchange with ${room?.participants?.map((p) => p.userId?.fullName).filter(Boolean).join(", ")}`
                            : `Exchange with ${otherUser?.fullName || "User"}`}
                    </p>
                </div>

                {/* ── ALERTS ────────────────────────────────────────── */}
                {actionSuccess && (
                    <div className="er-alert er-alert-success">
                        {actionSuccess}
                        <button className="er-alert-close" onClick={() => setActionSuccess("")}>×</button>
                    </div>
                )}
                {actionError && (
                    <div className="er-alert er-alert-error">
                        {actionError}
                        <button className="er-alert-close" onClick={() => setActionError("")}>×</button>
                    </div>
                )}

                {/* ── PROPOSED 3-WAY APPROVAL BANNER ────────────────── */}
                {isProposed && (
                    <div className="er-alert er-alert-warning p-4 rounded-4 shadow-sm mb-4 bg-white border">
                        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                            <div>
                                <h5 className="fw-bold mb-1 text-dark">
                                    🔄 3-Way Exchange Proposal ({acceptedCount}/{totalParticipants} Accepted)
                                </h5>
                                <p className="text-muted small mb-0">
                                    This group exchange requires <strong>all 3 participants</strong> to accept before the room and chat activate.
                                </p>
                            </div>

                            {isPendingMyApproval ? (
                                <div className="d-flex gap-2">
                                    <button
                                        className="btn btn-success rounded-pill px-4 fw-bold"
                                        onClick={() => handleProposalResponse("ACCEPTED")}
                                        disabled={responding}
                                    >
                                        {responding ? "Processing..." : "Accept 3-Way Exchange"}
                                    </button>
                                    <button
                                        className="btn btn-outline-danger rounded-pill px-3"
                                        onClick={() => handleProposalResponse("REJECTED")}
                                        disabled={responding}
                                    >
                                        Reject
                                    </button>
                                </div>
                            ) : (
                                <span className="badge bg-info text-dark px-3 py-2 rounded-pill fs-6">
                                    You Accepted! Waiting for Counterparties ({acceptedCount}/3)
                                </span>
                            )}
                        </div>
                    </div>
                )}

                <div className="er-grid">

                    {/* ── LEFT COLUMN: Chat ─────────────────────────── */}
                    <div className="er-chat-col">
                        <div className="er-card er-chat-card">
                            <div className="er-card-header">
                                <span className="er-card-icon">💬</span>
                                <h3>{isThreeWay ? "Group Chat" : "Messages"}</h3>
                                <span className="er-chat-count">{messages.length}</span>
                            </div>

                            {!canChat ? (
                                <div className="er-chat-locked">
                                    <span>🔒</span>
                                    <p>Chat will activate once all participants accept the exchange proposal.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="er-messages" ref={messagesContainerRef} onScroll={handleMessagesScroll}>
                                        {messages.length === 0 ? (
                                            <div className="er-no-messages">
                                                <span>👋</span>
                                                <p>No messages yet. Say hello to your exchange partner(s)!</p>
                                            </div>
                                        ) : (
                                            messages.map((msg) => {
                                                const senderId = msg.senderId?._id?.toString() || msg.senderId?.toString();
                                                const isOwn = senderId === myId;
                                                const isMeeting = msg.type === "MEETING";
                                                return (
                                                    <div
                                                        key={msg._id}
                                                        className={`er-message ${isOwn ? "er-message-own" : ""} ${isMeeting ? "er-message-meeting" : ""}`}
                                                    >
                                                        {!isOwn && (
                                                            <div className="er-msg-avatar">
                                                                {msg.senderId?.profilePicture ? (
                                                                    <img src={msg.senderId.profilePicture} alt={msg.senderId.fullName} />
                                                                ) : (
                                                                    <span>{msg.senderId?.fullName?.[0] || "?"}</span>
                                                                )}
                                                            </div>
                                                        )}
                                                        <div className="er-msg-bubble">
                                                            {!isOwn && <span className="er-msg-name">{msg.senderId?.fullName}</span>}
                                                            <p className="er-msg-text">{isMeeting ? "📅 " : ""}{msg.text}</p>
                                                            <span className="er-msg-time">
                                                                {formatDate(msg.createdAt)} {formatTime(msg.createdAt)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>

                                    {!isCompleted && (
                                        <form className="er-message-form" onSubmit={handleSend}>
                                            <input
                                                type="text"
                                                className="er-message-input"
                                                placeholder="Type a message..."
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                disabled={sending}
                                                maxLength={500}
                                            />
                                            <button
                                                type="submit"
                                                className="er-send-btn"
                                                disabled={sending || !newMessage.trim()}
                                            >
                                                {sending ? "..." : "Send"}
                                            </button>
                                        </form>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* ── RIGHT COLUMN: Details + Actions ──────────── */}
                    <div className="er-side-col">

                        {/* Exchange Details Card */}
                        <div className="er-card er-items-card">
                            <div className="er-card-header">
                                <span className="er-card-icon">🔄</span>
                                <h3>{isThreeWay ? "3-Way Ring Details" : "Exchange Details"}</h3>
                            </div>

                            {isThreeWay ? (
                                <div className="er-threeway-ring-details">
                                    {room?.items?.map((itemObj, idx) => {
                                        const fromName = itemObj.fromUserId?._id?.toString() === myId ? "You" : itemObj.fromUserId?.fullName;
                                        const toName = itemObj.toUserId?._id?.toString() === myId ? "You" : itemObj.toUserId?.fullName;

                                        return (
                                            <div className="er-item-row mb-2" key={idx}>
                                                <div className="er-item-thumb">
                                                    {itemObj.itemId?.images?.[0] ? (
                                                        <img src={itemObj.itemId.images[0]} alt={itemObj.itemId.title} />
                                                    ) : (
                                                        <span className="er-item-placeholder">📦</span>
                                                    )}
                                                </div>
                                                <div className="er-item-info">
                                                    <span className="er-item-label">{fromName} ➔ {toName}</span>
                                                    <strong>{itemObj.itemId?.title}</strong>
                                                    <span className="er-item-sub">{itemObj.itemId?.subcategory}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <>
                                    <div className="er-item-row">
                                        <div className="er-item-thumb">
                                            {myItem?.images?.[0] ? (
                                                <img src={myItem.images[0]} alt={myItem.title} />
                                            ) : (
                                                <span className="er-item-placeholder">📦</span>
                                            )}
                                        </div>
                                        <div className="er-item-info">
                                            <span className="er-item-label">You offer</span>
                                            <strong>{myItem?.title}</strong>
                                            <span className="er-item-sub">{myItem?.subcategory}</span>
                                        </div>
                                    </div>

                                    <div className="er-swap-divider">⇄</div>

                                    <div className="er-item-row">
                                        <div className="er-item-thumb">
                                            {theirItem?.images?.[0] ? (
                                                <img src={theirItem.images[0]} alt={theirItem.title} />
                                            ) : (
                                                <span className="er-item-placeholder">📦</span>
                                            )}
                                        </div>
                                        <div className="er-item-info">
                                            <span className="er-item-label">You receive</span>
                                            <strong>{theirItem?.title}</strong>
                                            <span className="er-item-sub">{theirItem?.subcategory}</span>
                                        </div>
                                    </div>

                                    <div className="er-other-user">
                                        <div className="er-other-avatar">
                                            {otherUser?.profilePicture ? (
                                                <img src={otherUser.profilePicture} alt={otherUser.fullName} />
                                            ) : (
                                                <span>{otherUser?.fullName?.[0] || "?"}</span>
                                            )}
                                        </div>
                                        <div>
                                            <span className="er-item-label">Exchange partner</span>
                                            <strong>{otherUser?.fullName}</strong>
                                            {otherUser?.averageRating > 0 && (
                                                <span className="er-rating">⭐ {otherUser.averageRating}</span>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Meeting Details Card */}
                        {canChat && (
                            <div className="er-card er-meeting-card">
                                <div className="er-card-header">
                                    <span className="er-card-icon">📍</span>
                                    <h3>Coordinate Meetup</h3>
                                </div>

                                {!isCompleted && (
                                    <form className="er-meeting-form" onSubmit={handleSaveMeeting}>
                                        <div className="er-form-group">
                                            <label>📍 Location</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. City Centre Mall"
                                                value={meetingLocation}
                                                onChange={(e) => setMeetingLocation(e.target.value)}
                                            />
                                        </div>
                                        <div className="er-form-row">
                                            <div className="er-form-group">
                                                <label>📅 Date</label>
                                                <input
                                                    type="date"
                                                    value={meetingDate}
                                                    onChange={(e) => setMeetingDate(e.target.value)}
                                                />
                                            </div>
                                            <div className="er-form-group">
                                                <label>⏰ Time</label>
                                                <input
                                                    type="time"
                                                    value={meetingTime}
                                                    onChange={(e) => setMeetingTime(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <button
                                            type="submit"
                                            className="er-btn er-btn-outline"
                                            disabled={savingMeeting}
                                        >
                                            {savingMeeting ? "Saving..." : "Save Meeting Details"}
                                        </button>
                                    </form>
                                )}
                            </div>
                        )}

                        {/* Complete Exchange Card */}
                        {isActive && (
                            <div className="er-card er-complete-card">
                                <div className="er-card-header">
                                    <span className="er-card-icon">✅</span>
                                    <h3>Mark as Completed</h3>
                                </div>
                                <p className="er-complete-desc">
                                    Once you've physically exchanged items with your counterparties, click below to complete the exchange.
                                </p>
                                <button
                                    className="er-btn er-btn-complete"
                                    onClick={() => setShowCompleteModal(true)}
                                >
                                    🎉 Complete Exchange
                                </button>
                            </div>
                        )}

                        {/* Review Panel */}
                        {isCompleted && showReviewPanel && !reviewDone && (
                            <div className="er-card er-review-card">
                                <div className="er-card-header">
                                    <span className="er-card-icon">⭐</span>
                                    <h3>Rate Your Experience</h3>
                                </div>
                                <form onSubmit={handleReviewSubmit}>
                                    <div className="er-star-rating">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                className={`er-star ${star <= reviewRating ? "er-star-active" : ""}`}
                                                onClick={() => setReviewRating(star)}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>
                                    <div className="er-form-group">
                                        <label>Comment (optional)</label>
                                        <textarea
                                            placeholder="How was your exchange experience?"
                                            value={reviewComment}
                                            onChange={(e) => setReviewComment(e.target.value)}
                                            rows={3}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="er-btn er-btn-primary"
                                        disabled={submittingReview}
                                    >
                                        {submittingReview ? "Submitting..." : "Submit Review"}
                                    </button>
                                </form>
                            </div>
                        )}

                        {isCompleted && reviewDone && (
                            <div className="er-card er-review-done">
                                <span>✅</span>
                                <p>Review submitted! Thank you.</p>
                            </div>
                        )}

                        {isCompleted && !showReviewPanel && !reviewDone && (
                            <div className="er-card er-complete-state">
                                <span className="er-complete-icon">🎊</span>
                                <h3>Exchange Completed!</h3>
                                <p>This exchange has been marked as complete.</p>
                                <button className="er-btn er-btn-outline" onClick={() => setShowReviewPanel(true)}>
                                    ⭐ Leave a Review
                                </button>
                                <Link to="/dashboard" className="er-btn er-btn-ghost">Back to Dashboard</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── COMPLETE CONFIRMATION MODAL ────────────────── */}
            {showCompleteModal && (
                <div className="er-modal-backdrop" onClick={() => !completing && setShowCompleteModal(false)}>
                    <div className="er-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="er-modal-icon">🎉</div>
                        <h3>Complete This Exchange?</h3>
                        <p>
                            This will mark all items in this room as <strong>exchanged</strong> and finalize the transaction.
                        </p>
                        <div className="er-modal-actions">
                            <button
                                className="er-btn er-btn-outline"
                                onClick={() => setShowCompleteModal(false)}
                                disabled={completing}
                            >
                                Not Yet
                            </button>
                            <button
                                className="er-btn er-btn-complete"
                                onClick={handleComplete}
                                disabled={completing}
                            >
                                {completing ? "Completing..." : "Yes, Complete!"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}