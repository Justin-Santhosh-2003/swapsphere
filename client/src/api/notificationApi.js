import API from "./axios";

export const getNotifications = (page = 1, limit = 20) =>
    API.get(`/notifications?page=${page}&limit=${limit}`);

export const getUnreadCount = () =>
    API.get("/notifications/unread-count");

export const markAsRead = (id) =>
    API.patch(`/notifications/${id}/read`);

export const markAllAsRead = () =>
    API.patch("/notifications/read-all");

export const deleteNotification = (id) =>
    API.delete(`/notifications/${id}`);

export const clearAll = () =>
    API.delete("/notifications/clear-all");
