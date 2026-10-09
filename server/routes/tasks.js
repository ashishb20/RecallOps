import express from 'express';
import {
    createTask,
    getAllTasks,
    getTodayReviews,
    getUpcomingReviews,
    getTaskById,
    markAsReviewed,
    updateTask,
    deleteTask,
    getTaskStats,
    getDashboardData
} from '../controllers/taskController.js';
import { authMiddleware } from '../middleware/auth.js';
import { createTaskValidation, updateTaskValidation, taskIdValidation, getTasksQueryValidation } from '../middleware/validation.js';

const router = express.Router();

router.get('/dashboard', authMiddleware, getDashboardData);
router.post('/', authMiddleware, createTaskValidation, createTask);

router.get('/', authMiddleware, getTasksQueryValidation, getAllTasks);
router.get('/stats', authMiddleware, getTaskStats);
router.get('/today', authMiddleware, getTodayReviews);
router.get('/upcoming', authMiddleware, getUpcomingReviews);
router.get('/:id', authMiddleware, taskIdValidation, getTaskById);

router.put('/:id/review', authMiddleware, taskIdValidation, markAsReviewed);
router.put('/:id', authMiddleware, updateTaskValidation, updateTask);

router.delete('/:id', authMiddleware, taskIdValidation, deleteTask);

export default router;