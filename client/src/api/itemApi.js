import API from "./axios";

export const getItems = (params = {}) => {

    return API.get("/items", {

        params

    });

};

export const getItemById = (id) => {

    return API.get(`/items/${id}`);

};

export const createItem = (data) => {

    return API.post("/items", data);

};

export const updateItem = (id, data) => {

    return API.put(`/items/${id}`, data);

};

export const deleteItem = (id) => {

    return API.delete(`/items/${id}`);

};