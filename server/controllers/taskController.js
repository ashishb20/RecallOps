import mongoose from 'mongoose';
import Task from '../models/Task.js';
import { getToday, getTomorrow, getDaysUntil } from '../utils/dateHelper.js';
import { calculateNextReviewDate, advanceStage } from '../services/reviewScheduler.js';
import { BadRequestError, NotFoundError } from '../utils/errors.js';

export const createTask = async (req, res, next) => {
    try {
        const { title, description, category } = req.body;
        const userId = req.userId;
        if (!title || title.trim() === '') {
            throw new BadRequestError('Task title is required');
        }
        const createdAt = new Date();
        const task = await Task.create({
            title: title.trim(),
            description: description?.trim() || '',
            category: category?.trim() || 'General',
            user: userId,
            reviewStage: 0,
            nextReviewDate: calculateNextReviewDate(createdAt, 0),
            lastReviewedAt: createdAt,
            reviewCount: 0,
            completed: false
        });
        res.status(201).json({
            message: 'Task created successfully',
            task
        });
    } catch (error) {
        next(error);
    }
};

export const getAllTasks = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { completed, page = 1, limit = 20 } = req.query;
        const query = { user: userId };
        if (completed !== undefined) {
            query.completed = completed === 'true';
        }
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        const [tasks, total] = await Promise.all([
            Task.find(query).lean().sort({ nextReviewDate: 1, createdAt: -1 }).skip(skip).limit(limitNum),
            Task.countDocuments(query),
        ]);

        res.status(200).json({
            tasks,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
                hasNext: pageNum < Math.ceil(total / limitNum),
                hasPrev: pageNum > 1,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const getTodayReviews = async (req, res, next) => {
    try {
        const userId = req.userId;
        const today = getToday();
        const tomorrow = getTomorrow();
        const tasks = await Task.find({
            user: userId,
            completed: false,
            nextReviewDate: { $gte: today, $lt: tomorrow }
        }).lean().sort({ createdAt: -1 });
        res.status(200).json({
            count: tasks.length,
            tasks
        });
    } catch (error) {
        next(error);
    }
};

export const getUpcomingReviews = async (req, res, next) => {
    try {
        const userId = req.userId;
        const tomorrow = getTomorrow();
        const tasks = await Task.find({
            user: userId,
            completed: false,
            nextReviewDate: { $gte: tomorrow }
        }).lean().sort({ nextReviewDate: 1 });
        const tasksWithDaysUntil = tasks.map(task => ({
            ...task,
            daysUntil: getDaysUntil(task.nextReviewDate)
        }));
        res.status(200).json({
            count: tasks.length,
            tasks: tasksWithDaysUntil
        });
    } catch (error) {
        next(error);
    }
};

export const getTaskById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const task = await Task.findOne({ _id: id, user: userId }).lean();
        if (!task) {
            throw new NotFoundError('Task not found');
        }
        res.status(200).json({ task });
    } catch (error) {
        next(error);
    }
};

export const markAsReviewed = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const task = await Task.findOne({ _id: id, user: userId });
        if (!task) {
            throw new NotFoundError('Task not found');
        }
        if (task.completed) {
            throw new BadRequestError('Task is already completed');
        }

        const updates = advanceStage(task);
        Object.assign(task, updates);
        await task.save();

        res.status(200).json({
            message: task.completed
                ? 'Task completed! All reviews done'
                : 'Task marked as review',
            task
        });
    } catch (error) {
        next(error);
    }
};

export const updateTask = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const { title, description, category } = req.body;
        const task = await Task.findOne({ _id: id, user: userId });
        if (!task) {
            throw new NotFoundError('Task not found');
        }
        if (title !== undefined) task.title = title.trim();
        if (description !== undefined) task.description = description.trim();
        if (category !== undefined) task.category = category.trim();
        await task.save();
        res.status(200).json({
            message: 'Task updated successfully',
            task
        });
    } catch (error) {
        next(error);
    }
};

export const deleteTask = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const task = await Task.findOneAndDelete({ _id: id, user: userId });
        if (!task) {
            throw new NotFoundError('Task not found');
        }
        res.status(200).json({
            message: 'Task deleted successfully',
            taskId: id
        });
    } catch (error) {
        next(error);
    }
};

export const getTaskStats = async (req, res, next) => {
    try {
        const userId = req.userId;
        const [total, completed, todayCount] = await Promise.all([
            Task.countDocuments({ user: userId }),
            Task.countDocuments({ user: userId, completed: true }),
            Task.countDocuments({
                user: userId,
                completed: false,
                nextReviewDate: {
                    $gte: getToday(),
                    $lt: getTomorrow()
                }
            })
        ]);
        const active = total - completed;
        res.status(200).json({
            stats: {
                total,
                active,
                completed,
                todayReviews: todayCount,
                completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getDashboardData = async (req, res, next) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.userId);
        const today = getToday();
        const tomorrow = getTomorrow();
        const [results] = await Task.aggregate([
            { $match: { user: userId } },
            {
                $facet: {
                    total: [{ $count: "count" }],
                    completed: [{ $match: { completed: true } }, { $count: "count" }],
                    todayReviews: [
                        { $match: { completed: false, nextReviewDate: { $gte: today, $lt: tomorrow } } },
                        { $sort: { createdAt: -1 } }
                    ],
                    upcomingReviews: [
                        { $match: { completed: false, nextReviewDate: { $gte: tomorrow } } },
                        { $sort: { nextReviewDate: 1 } },
                        { $limit: 50 }
                    ]
                }
            }
        ]);
        const totalCount = results.total[0]?.count || 0;
        const completedCount = results.completed[0]?.count || 0;
        const todayTasks = results.todayReviews || [];
        const upcomingTasks = results.upcomingReviews.map(task => ({
            ...task,
            _id: task._id.toString(),
            daysUntil: getDaysUntil(task.nextReviewDate)
        }));
        res.status(200).json({
            todayData: { tasks: todayTasks },
            upcomingData: { tasks: upcomingTasks },
            statsData: {
                stats: {
                    total: totalCount,
                    active: totalCount - completedCount,
                    completed: completedCount,
                    todayReviews: todayTasks.length,
                    completionRate: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
                }
            }
        });
    } catch (error) {
        next(error);
    }
};
