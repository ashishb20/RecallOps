import api from './api'

// Register new user
export const register = async (userData) => {
    try {
        const response = await api.post('/api/auth/register', userData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Registration failed' };
    }
};

// Login user
export const login = async (credentials) => {
    try {
        const response = await api.post('/api/auth/login', credentials);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Login failed' };
    }
};

// Logout user
export const logout = async () => {
    try {
        await api.post('/api/auth/logout');
    } catch {
        // ignore logout errors
    }
};

// Get current user info
export const getCurrentUser = async () => {
    try {
        const response = await api.get('/api/auth/me');
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to get user' };
    }
};

// Check if user is authenticated (cookie-based, always true if cookie exists)
export const isAuthenticated = () => {
    return true; // cookie presence handled by server
};

// get stored user from localstorage (for initial UI)
export const getStoredUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

