import API from "./axios";

export const sendExchangeRequest = (data) => {
    return API.post("/exchange-requests", data);
};

export const getMyExchangeRequests = (type = "all") => {
    return API.get(`/exchange-requests?type=${type}`);
};

export const respondToExchangeRequest = (id, status) => {
    return API.put(`/exchange-requests/${id}/respond`, { status });
};

export const cancelExchangeRequest = (id) => {
    return API.put(`/exchange-requests/${id}/cancel`);
};
