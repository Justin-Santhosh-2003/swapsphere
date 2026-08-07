import API from "./axios";

export const getCategories = () => {

    return API.get("/categories");

};

export const createCategory = (data) => {

    return API.post("/categories", data);

};

export const updateCategory = (id, data) => {

    return API.put(`/categories/${id}`, data);

};

export const deleteCategory = (id) => {

    return API.delete(`/categories/${id}`);

};