import api from './api'

// Task service 
// Create new task
export const createTask = async (taskData) => {
    try {
        const response = await api.post('/api/tasks', taskData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to create task'};
    }
};

// Get all tasks 
export const getAllTasks = async () => {
    try {
        const response = await api.get('/api/tasks');
        return response.data;
    } catch (error) {
        throw error.response?.data || {error: 'Failed to fetch tasks'};
    }
};

// Get today's reviews
export const getTodayReviews = async () => {
    try {
        const response = await api.get('/api/tasks/today');
        return response.data;
    } catch (error) {
        throw error.response?.data || { error : 'Failed to fetch today\'s reviews'};
    }
};
// Get upcoming reviews 
export const getUpcomingReviews = async () => {
    try {
        const response = await api.get('/api/tasks/upcoming');
        return response.data;
    } catch (error) {
        throw error.response?.data || { error : "Failed to fetch upcoming reviews"}
    }
} ;

// Get task statistics 
export const getTaskStats = async () => {
    try {
        const response = await api.get('/api/tasks/stats');
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to fetch statistics'};
    }
};
// Mark task as reviewed 

export const markAsReviewed = async (taskId) => {
    try {
        const response = await api.put(`/api/tasks/${taskId}/review`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to Mark as reviewed'};
    }
};
// Update task
export const updateTask = async (taskId, taskData) => {
    try {
        const response = await api.put(`/api/tasks/${taskId}`, taskData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to update task'};
    }
};
// Delete task
export const deleteTask = async (taskId) => {
    try {
        const response = await api.delete(`/api/tasks/${taskId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to delete task'};
    }
};