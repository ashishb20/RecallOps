import { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import {
    login as loginService,
    register as registerService,
    logout as logoutService,
    getCurrentUser,
    getStoredUser
} from '../services/authService';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            try {
                const storedUser = getStoredUser();
                if (storedUser) {
                    const data = await getCurrentUser();
                    if (data?.user) {
                        setUser(data.user);
                    } else {
                        logoutService();
                    }
                }
            } catch (error) {
                console.error('Failed to initialize auth:', error);
                logoutService();
            } finally {
                setLoading(false);
            }
        };
        initAuth();
    }, []);

    const login = async (credentials) => {
        try {
            const data = await loginService(credentials);
            if (!data || !data.user) {
                throw new Error('Invalid login response from server');
            }
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            return data;
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            const data = await registerService(userData);
            if (!data || !data.user) {
                throw new Error('Invalid registration response from server');
            }
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            return data;
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    };

    const logout = async () => {
        await logoutService();
        localStorage.removeItem('user');
        setUser(null);
    };

    const value = {
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        loading
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600"> Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};