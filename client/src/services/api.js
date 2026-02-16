import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout:10000,
});

api.interceptors.request.use(
    (config) => {
        // Get token from local storage
        const token = localStorage.getItem('token');
        //  Add token to Authorization header if exists
        if(token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
api.interceptors.response.use(
    (response) => {
        // Return successful response
        return response ;
    },
    (error) => {
        // Handle specific error cases
        if(error.response) {
            const { status } = error.response
            // Server responded with error status;
            switch (status) {
                case 401:
                    // UNauthorized - token expired or invalid
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    // Redirect to login 
                    window.location.href = '/login';
                    break;
                case 403:
                    // User doesn't have permission
                    console.error('Access forbidden');
                    break;
                case 404:
                    // Not found
                    console.error('Resource Not found');
                    break;
                case 500:
                    console.error('Server error');
                    break; 
                default:
                    console.error('API error:' , error.response.data);
            }
        } else if (error.request) {
            console.error('Network error - please check your connection');
        } else {
            console.error('Error:', error.message);
        }
        return Promise.reject(error);
    }
);
export default api;