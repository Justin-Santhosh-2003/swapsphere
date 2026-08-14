import API from "./axios";

export const createReview = (data) => {
    return API.post("/reviews", data);
};

export const getUserReviews = (userId) => {
    return API.get(`/reviews/user/${userId}`);
};
