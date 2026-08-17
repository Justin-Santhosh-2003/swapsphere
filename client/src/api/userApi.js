import API from "./axios";

export const getPublicProfile = (userId) =>
    API.get(`/users/${userId}`);
