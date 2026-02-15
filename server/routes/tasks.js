import express from 'express'
import {
    createTask,
    getAllTasks,
    getTodayReviews,
    getUpcomingReviews,
    getTaskById,
    markAsReviewed,
    updateTask,
    deleteTask,
    getTaskStats
} from '../controllers/taskController.js';
import { authMiddleware } from '../middleware/auth.js';
const router = express.Router();

router.post('/', authMiddleware, createTask);

router.get('/', authMiddleware, getAllTasks);
router.get('/stats', authMiddleware, getTaskStats);
router.get('/today', authMiddleware, getTodayReviews);
router.get('/upcoming', authMiddleware, getUpcomingReviews);
router.get('/:id', authMiddleware, getTaskById);

router.put('/:id/review', authMiddleware, markAsReviewed);
router.put('/:id', authMiddleware, updateTask);

router.delete('/:id', authMiddleware, deleteTask);


export default router