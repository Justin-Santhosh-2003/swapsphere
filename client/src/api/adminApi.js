import API from "./axios";

// Stats
export const getAdminStats = () => API.get("/admin/stats");

// Users
export const getAdminUsers = (params = {}) =>
    API.get("/admin/users", { params });

export const toggleSuspendUser = (id) =>
    API.patch(`/admin/users/${id}/suspend`);

export const toggleAdminRole = (id) =>
    API.patch(`/admin/users/${id}/make-admin`);

// Listings
export const getAdminListings = (params = {}) =>
    API.get("/admin/listings", { params });

export const removeListing = (id) =>
    API.patch(`/admin/listings/${id}/remove`);

export const restoreListing = (id) =>
    API.patch(`/admin/listings/${id}/restore`);

// Exchanges
export const getAdminExchanges = (params = {}) =>
    API.get("/admin/exchanges", { params });

// Categories
export const getAdminCategories = () => API.get("/admin/categories");

export const createCategory = (data) => API.post("/admin/categories", data);

export const updateCategory = (id, data) =>
    API.put(`/admin/categories/${id}`, data);

export const deleteCategory = (id) =>
    API.delete(`/admin/categories/${id}`);
