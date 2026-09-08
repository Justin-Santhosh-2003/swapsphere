import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { getUnreadCount, getNotifications, markAsRead, markAllAsRead, deleteNotification, clearAll } from "../api/notificationApi";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { isAuthenticated, user } = useAuth();

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const pollRef = useRef(null);

    // Fetch unread count (lightweight, used for badge)
    const fetchUnreadCount = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const res = await getUnreadCount();
            setUnreadCount(res.data.unreadCount || 0);
        } catch {
            // silently fail
        }
    }, [isAuthenticated]);

    // Fetch full notification list
    const fetchNotifications = useCallback(async (pageNum = 1) => {
        if (!isAuthenticated) return;
        setLoading(true);
        try {
            const res = await getNotifications(pageNum, 20);
            const { notifications: fetched, pages, unreadCount: uc } = res.data;
            if (pageNum === 1) {
                setNotifications(fetched);
            } else {
                setNotifications((prev) => [...prev, ...fetched]);
            }
            setUnreadCount(uc);
            setHasMore(pageNum < pages);
            setPage(pageNum);
        } catch {
            // silently fail
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    // Mark single notification as read
    const handleMarkAsRead = async (id) => {
        try {
            await markAsRead(id);
            setNotifications((prev) =>
                prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch {
            // silently fail
        }
    };

    // Mark all as read
    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch {
            // silently fail
        }
    };

    // Delete one notification
    const handleDelete = async (id) => {
        try {
            await deleteNotification(id);
            const deleted = notifications.find((n) => n._id === id);
            setNotifications((prev) => prev.filter((n) => n._id !== id));
            if (deleted && !deleted.isRead) {
                setUnreadCount((prev) => Math.max(0, prev - 1));
            }
        } catch {
            // silently fail
        }
    };

    // Clear all notifications
    const handleClearAll = async () => {
        try {
            await clearAll();
            setNotifications([]);
            setUnreadCount(0);
        } catch {
            // silently fail
        }
    };

    // Load more (pagination)
    const loadMore = () => {
        if (hasMore && !loading) {
            fetchNotifications(page + 1);
        }
    };

    // Start polling when authenticated
    useEffect(() => {
        if (isAuthenticated && user) {
            fetchNotifications(1);

            // Poll every 30 seconds for new notifications
            pollRef.current = setInterval(() => {
                fetchUnreadCount();
            }, 30000);
        } else {
            setNotifications([]);
            setUnreadCount(0);
        }

        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, [isAuthenticated, user, fetchNotifications, fetchUnreadCount]);

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                loading,
                hasMore,
                fetchNotifications,
                markAsRead: handleMarkAsRead,
                markAllAsRead: handleMarkAllAsRead,
                deleteNotification: handleDelete,
                clearAll: handleClearAll,
                loadMore
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);
