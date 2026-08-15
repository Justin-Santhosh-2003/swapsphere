import API from "./axios";

export const getMessages = (exchangeRequestId) => {
    return API.get(`/messages/${exchangeRequestId}`);
};

export const sendMessage = (exchangeRequestId, text, type = "TEXT") => {
    return API.post(`/messages/${exchangeRequestId}`, { text, type });
};
