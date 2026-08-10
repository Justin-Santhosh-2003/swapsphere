import { createContext, useContext, useEffect, useState, useCallback } from "react";
import API from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
    const [loading, setLoading] = useState(true);

    const fetchUser = useCallback(async () => {
        const storedToken = localStorage.getItem("token");
        if (!storedToken) {
            setUser(null);
            setIsAuthenticated(false);
            setLoading(false);
            return;
        }

        try {
            const res = await API.get("/users/me");
            setUser(res.data.user || res.data);
            setIsAuthenticated(true);
        } catch (error) {
            console.error("AuthContext fetchUser error:", error);
            localStorage.removeItem("token");
            setToken(null);
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [token, fetchUser]);

    const login = (newToken, userData = null) => {
        localStorage.setItem("token", newToken);
        setToken(newToken);
        if (userData) {
            setUser(userData);
        }
        setIsAuthenticated(true);
        fetchUser();
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        window.dispatchEvent(new Event("authChanged"));
    };

    const updateUser = (updatedUserData) => {
        setUser((prev) => ({ ...prev, ...updatedUserData }));
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                isAuthenticated,
                loading,
                login,
                logout,
                updateUser,
                fetchUser
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};