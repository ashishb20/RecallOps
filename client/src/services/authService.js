import api from './api'

// Register new user
export const register = async (userData) => {
    try {
        const response = await api.post('/api/auth/register',userData);
        // save token and user to localStorage
        if(response.data.token && response.data.user) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));

        }
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Registration failed'};
    }
};

// Login user
export const login = async (Credentials) => {
    try {
        const response = await api.post('/api/auth/login', Credentials); 
        // save token ans user to local storage
        if(response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    } catch (error) {
        throw error.response?.data || { error : 'Login failed'};
    }
};

//  Logout user
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};
// Get current user info
export const getCurrentUser = async () => {
    try {
        const response = await api.get('/api/auth/me');
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to get user'};
    }
};

// Check if user is authenticated
export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};

// get stored user from localstorage
export const getStoredUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

