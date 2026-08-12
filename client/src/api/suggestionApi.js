import API from "./axios";

export const getSuggestions = () => {
    return API.get("/suggestions");
};
