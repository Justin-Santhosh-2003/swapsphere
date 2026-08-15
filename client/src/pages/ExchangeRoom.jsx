import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getExchangeRequestById, completeExchangeRequest } from "../api/exchangeRequestApi";
import { getMessages, sendMessage } from "../api/messageApi";
import { createReview } from "../api/reviewApi";
import "./ExchangeRoom.css";

const POLL_INTERVAL = 5000; // 5 seconds

const statusColors = {
    ACCEPTED: "status-accepted",
    COMPLETED: "status-completed",
    PENDING: "status-pending",
    CANCELLED: "status-cancelled",
    REJECTED: "status-rejected"
};

const statusLabels = {
    ACCEPTED: "In Progress",
    COMPLETED: "Completed",
    PENDING: "Pending",
    CANCELLED: "Cancelled",
    REJECTED: "Rejected"
};

export default function ExchangeRoom() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [exchange, setExchange] = useState(null);
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
    const [sendingMeeting, setSendingMeeting] = useState(false);
    const [meetingSent, setMeetingSent] = useState(false);

    // Complete exchange
    const [completing, setCompleting] = useState(false);
    const [showCompleteModal, setShowCompleteModal] = useState(false);

    // Review panel (shown after completion)
    const [showReviewPanel, setShowReviewPanel] = useState(false);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewDone, setReviewDone] = useState(false);

    const messagesContainerRef = useRef(null);
    const pollingRef = useRef(null);
    const isNearBottomRef = useRef(true); // true when user is within 80px of bottom
    const isInitialLoadRef = useRef(true);

    // Normalize current user id
    const myId = user?._id?.toString() || user?.id?.toString();

    // ─── Load Exchange ───────────────────────────────────────────
    const loadExchange = useCallback(async () => {
        try {
            const res = await getExchangeRequestById(id);
            const req = res.data.request;

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
                setError(err.response?.data?.message || "Failed to load exchange.");
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
            
            // Only update state if messages actually changed (prevents polling re-renders)
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
        loadExchange();
    }, [loadExchange]);

    useEffect(() => {
        if (!exchange) return;
        if (!["ACCEPTED", "COMPLETED"].includes(exchange.status)) return;

        loadMessages();
        pollingRef.current = setInterval(loadMessages, POLL_INTERVAL);

        return () => clearInterval(pollingRef.current);
    }, [exchange, loadMessages]);

    // Auto-scroll inside chat box ONLY — never scrolls the browser window
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

    // Track scroll position to know if user has scrolled up inside the chat box
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
            // Force-scroll to bottom when YOU send a message
            isNearBottomRef.current = true;
            await loadMessages();
        } catch (err) {
            setActionError(err.response?.data?.message || "Failed to send message.");
        } finally {
            setSending(false);
        }
    };

    // ─── Send Meeting Details ─────────────────────────────────────
    const handleSendMeeting = async (e) => {
        e.preventDefault();
        if (!meetingLocation && !meetingDate && !meetingTime) return;
        setSendingMeeting(true);
        try {
            const parts = [];
            if (meetingLocation) parts.push(`📍 Location: ${meetingLocation}`);
            if (meetingDate) parts.push(`📅 Date: ${meetingDate}`);
            if (meetingTime) parts.push(`⏰ Time: ${meetingTime}`);
            const text = parts.join("  |  ");
            await sendMessage(id, text, "MEETING");
            setMeetingSent(true);
            await loadMessages();
        } catch (err) {
            setActionError(err.response?.data?.message || "Failed to send meeting details.");
        } finally {
            setSendingMeeting(false);
        }
    };

    // ─── Complete Exchange ────────────────────────────────────────
    const handleComplete = async () => {
        setCompleting(true);
        setActionError("");
        try {
            await completeExchangeRequest(id);
            setShowCompleteModal(false);
            setActionSuccess("🎉 Exchange marked as completed! Both items are now exchanged.");
            setShowReviewPanel(true);
            await loadExchange();
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

    // ─── Derived helpers ─────────────────────────────────────────
    const getMyItem = () => {
        if (!exchange) return null;
        const requesterId = exchange.requesterId?._id?.toString() || exchange.requesterId?.toString();
        return myId === requesterId ? exchange.offeredItemId : exchange.requestedItemId;
    };

    const getTheirItem = () => {
        if (!exchange) return null;
        const requesterId = exchange.requesterId?._id?.toString() || exchange.requesterId?.toString();
        return myId === requesterId ? exchange.requestedItemId : exchange.offeredItemId;
    };

    const getOtherUser = () => {
        if (!exchange) return null;
        const requesterId = exchange.requesterId?._id?.toString() || exchange.requesterId?.toString();
        return myId === requesterId ? exchange.receiverId : exchange.requesterId;
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString([], { month: "short", day: "numeric" });
    };

    // ─── Render States ────────────────────────────────────────────
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

    if (!exchange) return null;

    const myItem = getMyItem();
    const theirItem = getTheirItem();
    const otherUser = getOtherUser();
    const isCompleted = exchange.status === "COMPLETED";
    const isAccepted = exchange.status === "ACCEPTED";
    const canComplete = isAccepted;

    return (
        <section className="er-section">
            <div className="er-container">

                {/* ── HEADER ────────────────────────────────────────── */}
                <div className="er-header">
                    <div className="er-header-top">
                        <Link to="/dashboard" className="er-back-btn">
                            ← Dashboard
                        </Link>
                        <span className={`er-status-badge ${statusColors[exchange.status] || ""}`}>
                            {statusLabels[exchange.status] || exchange.status}
                        </span>
                    </div>
                    <h1 className="er-title">
                        {myItem?.title} <span className="er-swap-arrow">⇄</span> {theirItem?.title}
                    </h1>
                    <p className="er-subtitle">
                        Exchange with <strong>{otherUser?.fullName}</strong>
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

                <div className="er-grid">

                    {/* ── LEFT COLUMN: Chat ─────────────────────────── */}
                    <div className="er-chat-col">
                        <div className="er-card er-chat-card">
                            <div className="er-card-header">
                                <span className="er-card-icon">💬</span>
                                <h3>Messages</h3>
                                <span className="er-chat-count">{messages.length}</span>
                            </div>

                            {!isAccepted && !isCompleted ? (
                                <div className="er-chat-locked">
                                    <span>🔒</span>
                                    <p>Chat is available once the exchange is accepted.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="er-messages" ref={messagesContainerRef} onScroll={handleMessagesScroll}>
                                        {messages.length === 0 ? (
                                            <div className="er-no-messages">
                                                <span>👋</span>
                                                <p>No messages yet. Say hello!</p>
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
                                <h3>Exchange Details</h3>
                            </div>

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
                        </div>

                        {/* Meeting Details Card */}
                        {(isAccepted || isCompleted) && (
                            <div className="er-card er-meeting-card">
                                <div className="er-card-header">
                                    <span className="er-card-icon">📍</span>
                                    <h3>Coordinate Meetup</h3>
                                </div>

                                {/* Show last meeting message if exists */}
                                {messages.filter(m => m.type === "MEETING").slice(-1).map(m => (
                                    <div key={m._id} className="er-last-meeting">
                                        <p>{m.text}</p>
                                        <span>Shared by {m.senderId?.fullName} · {formatDate(m.createdAt)}</span>
                                    </div>
                                ))}

                                {!isCompleted && (
                                    <form className="er-meeting-form" onSubmit={handleSendMeeting}>
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
                                            disabled={sendingMeeting || (!meetingLocation && !meetingDate && !meetingTime)}
                                        >
                                            {meetingSent ? "✅ Meeting Details Shared" : sendingMeeting ? "Sharing..." : "Share Meeting Details"}
                                        </button>
                                    </form>
                                )}
                            </div>
                        )}

                        {/* Complete Exchange Card */}
                        {canComplete && (
                            <div className="er-card er-complete-card">
                                <div className="er-card-header">
                                    <span className="er-card-icon">✅</span>
                                    <h3>Mark as Completed</h3>
                                </div>
                                <p className="er-complete-desc">
                                    Once you've physically exchanged items with {otherUser?.fullName}, click below to complete the exchange.
                                </p>
                                <button
                                    className="er-btn er-btn-complete"
                                    onClick={() => setShowCompleteModal(true)}
                                >
                                    🎉 Complete Exchange
                                </button>
                            </div>
                        )}

                        {/* Review Panel (after completion) */}
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
                                            placeholder={`How was your experience with ${otherUser?.fullName}?`}
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
                            This will mark both items as <strong>exchanged</strong> and close the exchange. Make sure you've physically received <strong>{theirItem?.title}</strong> before confirming.
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