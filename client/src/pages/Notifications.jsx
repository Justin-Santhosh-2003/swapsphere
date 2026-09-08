import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";
import "./Notifications.css";

const TYPE_ICON = {
    EXCHANGE_REQUEST:  "🔄",
    REQUEST_ACCEPTED:  "✅",
    REQUEST_REJECTED:  "❌",
    REQUEST_CANCELLED: "↩️",
    NEW_MESSAGE:       "💬",
    EXCHANGE_COMPLETED:"🎉",
    ACCOUNT_SUSPENDED: "⛔",
    ACCOUNT_ACTIVATED: "✅",
    ITEM_REMOVED:      "🗑️",
    GENERAL:           "📢"
};

const TYPE_COLOR = {
    EXCHANGE_REQUEST:  "#6366f1",
    REQUEST_ACCEPTED:  "#22c55e",
    REQUEST_REJECTED:  "#ef4444",
    REQUEST_CANCELLED: "#f59e0b",
    NEW_MESSAGE:       "#3b82f6",
    EXCHANGE_COMPLETED:"#a855f7",
    ACCOUNT_SUSPENDED: "#ef4444",
    ACCOUNT_ACTIVATED: "#22c55e",
    ITEM_REMOVED:      "#ef4444",
    GENERAL:           "#64748b"
};

function timeAgo(dateStr) {
    const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long"
    });
}

function groupByDate(notifications) {
    const groups = {};
    notifications.forEach((n) => {
        const key = formatDate(n.createdAt);
        if (!groups[key]) groups[key] = [];
        groups[key].push(n);
    });
    return groups;
}

export default function Notifications() {
    const navigate = useNavigate();
    const {
        notifications,
        unreadCount,
        loading,
        hasMore,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        loadMore
    } = useNotifications();

    const [filter, setFilter] = useState("ALL"); // ALL | UNREAD | READ

    const filtered = notifications.filter((n) => {
        if (filter === "UNREAD") return !n.isRead;
        if (filter === "READ") return n.isRead;
        return true;
    });

    const grouped = groupByDate(filtered);

    const handleClick = (notif) => {
        if (!notif.isRead) markAsRead(notif._id);
        if (notif.link) navigate(notif.link);
    };

    return (
        <div className="notif-page">
            <div className="notif-page-container">

                {/* HEADER */}
                <div className="notif-page-header">
                    <div className="notif-page-title-row">
                        <div>
                            <h1 className="notif-page-h1">
                                🔔 Notifications
                                {unreadCount > 0 && (
                                    <span className="notif-page-badge">{unreadCount} new</span>
                                )}
                            </h1>
                            <p className="notif-page-sub">
                                Stay on top of your exchange activity
                            </p>
                        </div>

                        <div className="notif-page-actions">
                            {unreadCount > 0 && (
                                <button
                                    className="notif-action-btn notif-action-btn--primary"
                                    onClick={markAllAsRead}
                                >
                                    ✓ Mark all read
                                </button>
                            )}
                            {notifications.length > 0 && (
                                <button
                                    className="notif-action-btn notif-action-btn--danger"
                                    onClick={clearAll}
                                >
                                    🗑 Clear all
                                </button>
                            )}
                        </div>
                    </div>

                    {/* FILTER TABS */}
                    <div className="notif-filter-tabs">
                        {["ALL", "UNREAD", "READ"].map((f) => (
                            <button
                                key={f}
                                className={`notif-filter-tab ${filter === f ? "notif-filter-tab--active" : ""}`}
                                onClick={() => setFilter(f)}
                            >
                                {f === "ALL" ? `All (${notifications.length})`
                                    : f === "UNREAD" ? `Unread (${notifications.filter(n => !n.isRead).length})`
                                    : `Read (${notifications.filter(n => n.isRead).length})`}
                            </button>
                        ))}
                    </div>
                </div>

                {/* NOTIFICATIONS LIST */}
                <div className="notif-page-list">

                    {loading && notifications.length === 0 ? (

                        <div className="notif-page-empty">
                            <div className="notif-page-spinner" />
                            <p>Loading notifications...</p>
                        </div>

                    ) : filtered.length === 0 ? (

                        <div className="notif-page-empty">
                            <span className="notif-page-empty-icon">🔕</span>
                            <h3>No notifications</h3>
                            <p>
                                {filter === "UNREAD"
                                    ? "You're all caught up! No unread notifications."
                                    : "You don't have any notifications yet."}
                            </p>
                        </div>

                    ) : (

                        Object.entries(grouped).map(([dateLabel, notifs]) => (

                            <div key={dateLabel} className="notif-group">

                                <div className="notif-group-label">{dateLabel}</div>

                                {notifs.map((notif) => (

                                    <div
                                        key={notif._id}
                                        className={`notif-card ${!notif.isRead ? "notif-card--unread" : ""}`}
                                        onClick={() => handleClick(notif)}
                                        style={{
                                            "--notif-color": TYPE_COLOR[notif.type] || "#64748b"
                                        }}
                                    >
                                        <div
                                            className="notif-card-icon-wrap"
                                            style={{
                                                background: `${TYPE_COLOR[notif.type]}20`,
                                                borderColor: `${TYPE_COLOR[notif.type]}40`
                                            }}
                                        >
                                            <span className="notif-card-icon">
                                                {TYPE_ICON[notif.type] || "🔔"}
                                            </span>
                                        </div>

                                        <div className="notif-card-body">
                                            <p className="notif-card-msg">{notif.message}</p>
                                            <div className="notif-card-meta">
                                                <span className="notif-card-time">
                                                    {timeAgo(notif.createdAt)}
                                                </span>
                                                {notif.link && (
                                                    <span className="notif-card-link-hint">
                                                        Click to view →
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="notif-card-right">
                                            {!notif.isRead && (
                                                <span className="notif-card-dot" />
                                            )}
                                            <button
                                                className="notif-card-delete"
                                                title="Delete notification"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteNotification(notif._id);
                                                }}
                                            >
                                                ×
                                            </button>
                                        </div>

                                    </div>

                                ))}

                            </div>

                        ))

                    )}

                    {hasMore && (
                        <div className="notif-load-more">
                            <button
                                className="notif-load-more-btn"
                                onClick={loadMore}
                                disabled={loading}
                            >
                                {loading ? "Loading..." : "Load more"}
                            </button>
                        </div>
                    )}

                </div>

            </div>
        </div>
    );
}
