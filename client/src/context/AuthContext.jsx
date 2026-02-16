import { createContext, useState, useEffect } from 'react';

import {
    login as loginService,
    register as registerService,
    logout as logoutService,
    isAuthenticated,
    getStoredUser
} from '../services/authService';

// Auth context
export const AuthContext = createContext(null);

export const AuthProvider = ({ children}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const initAuth = () => {
            try{
                if(isAuthenticated()) {
                    const storedUser = getStoredUser();
                    setUser(storedUser);
                }
            } catch (error) {
                console.error('Failed to initialize auth:', error);
                logoutService();
            }  finally {
                setLoading(false);
            };
        }
        initAuth();
    }, []);
    
    // Login function
    const login = async (credentials) => {
        try {
            const data = await loginService(credentials);
            if(!data || !data.user) {
                throw new Error('Invalid login response from serve');
            }
            setUser(data.user);
            return data;
        } catch (error) {
            console.error("Login failed:", error);
            throw error ;
        }
    };

    // Register 
    const register = async (userData) => {
        try {
            const data = await registerService(userData);
            if(!data || !data.user) {
                throw new Error('Invalid registration response from server');
            }
            setUser(data.user);
            return data;
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    };
    // Logout function
    const logout = () => {
        logoutService();
        setUser(null);
    };
    const value = {
        user,
        login,
        register,
        logout,
        isAuthenticated : !!user,
        loading
    };
    if(loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
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