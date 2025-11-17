import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import apiClient from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = () => {
        apiClient.get('/notifications/count')
            .then(res => setUnreadCount(res.data.count))
            .catch(err => console.error("Помилка завантаження лічильника:", err));
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUser(decoded.sub);
                fetchUnreadCount();
            } catch (err) {
                localStorage.removeItem("token");
            }
        }
    }, []);

    const login = (token) => {
        localStorage.setItem("token", token);
        const decoded = jwtDecode(token);
        setUser(decoded.sub);
        fetchUnreadCount();
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        setUnreadCount(0);
    };

    const updateSubscriptionStatus = (newPlanName) => {
        setUser(currentUser => ({
            ...currentUser,
            plan: newPlanName
        }));
    };

    const clearUnreadCount = () => {
        setUnreadCount(0);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateSubscriptionStatus, unreadCount, clearUnreadCount}}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);