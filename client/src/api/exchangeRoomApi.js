import API from "./axios";

export const initiateThreeWayRoom = (data) => {
    return API.post("/exchange-rooms/three-way", data);
};

export const getMyExchangeRooms = () => {
    return API.get("/exchange-rooms/my-rooms");
};

export const getExchangeRoomById = (id) => {
    return API.get(`/exchange-rooms/${id}`);
};

export const respondToThreeWayProposal = (id, status) => {
    return API.put(`/exchange-rooms/${id}/respond`, { status });
};

export const updateMeetingDetails = (id, details) => {
    return API.put(`/exchange-rooms/${id}/meeting`, details);
};

export const completeRoomExchange = (id) => {
    return API.put(`/exchange-rooms/${id}/complete`);
};
