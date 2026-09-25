import axios from "axios";

const API = axios.create({

    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api"

});

// Automatically attach JWT token

API.interceptors.request.use(

    (config) => {

        const token = localStorage.getItem("token");

        if (token) {

            config.headers.Authorization = `Bearer ${token}`;

        }

        return config;

    },

    (error) => Promise.reject(error)

);

// Handle suspended account — auto logout and redirect to login
API.interceptors.response.use(

    (response) => response,

    (error) => {
        if (
            error.response?.status === 403 &&
            error.response?.data?.suspended === true
        ) {
            // Clear all auth data
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            // Store message to show on login page
            sessionStorage.setItem(
                "authError",
                "Your account has been suspended. Please contact support."
            );

            // Force redirect to login
            window.location.href = "/login";
        }

        return Promise.reject(error);
    }

);

export default API;