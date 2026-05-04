'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check if we have tokens on mount
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            // Validate token by fetching user profile (we'll add a simple endpoint later)
            // For now, just assume user is logged in and try to get user info from token
            // Actually, we'll use the /api/auth/token/refresh/ to verify
            // Simpler: just try to call a protected endpoint or decode token.
            // For now, we'll create a minimal profile endpoint.
            // But we don't have one yet. We can use the stories list as a check.
            api.get('/stories')
                .then(() => {
                    // If we can fetch stories, token is valid.
                    // For user information, we'll store username after login.
                    const username = localStorage.getItem('username');
                    setUser({ username });
                })
                .catch(() => {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (username, password) => {
        const { data } = await api.post('/auth/token', { username, password });
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        localStorage.setItem('username', username); // simple storage
        setUser({ username });
    };

    const register = async (username, email, password) => {
        const { data } = await api.post('/auth/register', { username, email, password });
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        localStorage.setItem('username', data.user.username);
        setUser({ username: data.user.username });
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('username');
        setUser(null);
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};