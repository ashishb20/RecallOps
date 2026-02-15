import Task from '../models/Task.js';
import { getToday, getTomorrow, calculateNextReviewDate, getDaysUntil } from '../utils/dateHelper.js';

export const createTask = async (req, res) => {
    try {
        const { title, description, category } = req.body;
        const userId = req.userId;
        if(!title || title.trim() === ''){
            return res.status(400).json({
                error: 'Task title is required'
            });
        }
        const task = await Task.create({
            title: title.trim(),
            description: description?.trim() || '',
            category: category?.trim() || 'General',
            user: userId,
            reviewStage: 0,
            nextReviewDate: getTomorrow(),
            lastReviewedAt: new Date(),
            reviewCount: 0,
            completed: false
        });
        console.log('Task created:', task.title);
        res.status(201).json({
            message: 'Task created successfully',
            task
        });
    } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({
            error: 'Failed to create task'
        });
    }
};

export const getAllTasks = async (req, res) => {
    try {
         const userId = req.userId;
         const { completed } = req.query;
        //  Build query 
         const query = { user: userId };
         if (completed !== undefined) {
            query.completed = completed ==='true';
         }
        //   get tasks, sort by nextReviewDate (earliest first)
        const tasks = await Task.find(query)
        .sort({ nextReviewDate: 1, createdAt: -1});
        res.status(200).json({
            count: tasks.length,
            tasks
        });
    } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({
            error: 'Failed to fetch tasks'
        });
    }
};

// Get todays reviews

export const getTodayReviews = async (req, res) => {
    try {
         const userId = req.userId;
         const today = getToday();
         const tomorrow = getTomorrow()

        //  find tasks whose nextReviewDate is today
        const tasks = await Task.find({
            user: userId,
            completed: false,
            nextReviewDate: {
                $gte: today,
                $lt: tomorrow
            }
        }).sort({ createdAt : -1 });
        console.log(`Found ${tasks.length} tasks for today`);
        res.status(200).json({
            count: tasks.length,
            tasks
        });
    } catch (error) {
        console.error('Get today reviews error:', error);
        res.status(500).json({
            error: 'Failed to fetch today\'s reviews'
        });
    }
};

// Get upcoming reviews
export const getUpcomingReviews = async (req, res) => {
    try{
        const userId = req.userId;
        const tomorrow = getTomorrow();
        // find task schedule after today
        const tasks = await Task.find({
            user: userId,
            completed:false,
            nextReviewDate: { $gte: tomorrow }
        }).sort({ nextReviewDate : 1 });
        // Add 'Days until ' info for frontend
        const tasksWithDaysUntil = tasks.map(task => ({
            ...task.toObject(),
            daysUntil:getDaysUntil(task.nextReviewDate)
        }));
        console.log(`Found ${tasks.length} upcoming reviews`);
        res.status(200).json({
            count:tasks.length,
            tasks: tasksWithDaysUntil
        });
    } catch (error) {
        console.error('Get upcoming reviews error:', error);
        res.status(500).json({
            error: 'Failed to fetch upcoming reviews'
        });
    }
};

// Get single tasks 
export const getTaskById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const task = await Task.findOne({ _id: id, user:userId });
        if(!task) {
            return res.status(404).json({
                error:'Task not found'
            });
        }
        res.status(200).json({ task });
    } catch (error) {
        console.error('Get task error:', error);
        res.status(500).json({
            error: 'Failed to fetch task'
        });
    }
};

// Mark as Reviewed
export const markAsReviewed = async (req, res) => {
    try {
        const { id}  = req.params;
        const userId = req.userId;
        const task = await Task.findOne({ _id: id, user: userId });
        if(!task ) {
            return res.status(404).json({
                error: 'Task not found'
            });
        }

        // check if task already completed
        if(task.completed) {
            return res.status(400).json({
                error: 'Task is already completed'
            });
        }
        // Update review data
        task.reviewCount += 1;
        task.lastReviewedAt = new Date();
        task.reviewStage += 1 ;
        // calculate next review date based on new stage

        if(task.reviewStage >= 3) {
            task.completed = true ;
            task.nextReviewDate = null;
            console.log('Task completed:', task.title);
        } else {
            // calculate next review (1, 4 or 7 days)
            task.nextReviewDate = calculateNextReviewDate(task.reviewStage);
            console.log(`Task reviewed. Next review: ${task.nextReviewDate}`);
        }
        // save changes
        await task.save();
        res.status(200).json({
            message:task.completed
            ? 'Task completed! All reviews done'
            : 'Task marked as review',
            task
        });
    } catch (error) {
        console.error('Mark reviewed error:', error);
        res.status(500).json({
            error: 'Failed to mark task as reviewed'
        });
    }
};

// Update task 
export const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const { title, description, category } = req.body;
        //  find task 
        const task = await Task.findOne({ _id: id, user: userId });
        if(!task) {
            return res.status(404).json({
                error: 'Task not found'
            });
        }

        // Update fields if provided 
        if(title !== undefined) task.title = title.trim();
        if(description !== undefined) task.description = description.trim();
        if(category !== undefined) task.category = category.trim();
        await task.save();
        console.log('Task updated:', task.title);
        res.status(200).json({
            message: 'Task updated successfully',
            task 
        });
    } catch (error) {
        console.error('Update task error:', error);
        res.status(500).json({
            error: 'Failed to update task'
        });
    }
};

// Delete task 
export const deleteTask = async ( req, res) => {
    try {
        const { id }= req.params
        const userId = req.userId;
        const task = await Task.findOneAndDelete({ _id: id, user:userId });

        if(!task) {
            return res.status(404).json({
                error: 'Task not found'
            });
        }
        console.log('Task deleted:', task.title);
        res.status(200).json({
            message:'Task deleted successfully',
            taskId:id
        });
    }catch (error) {
        console.error('Delete task error:', error);
        res.status(500).json({
            error: 'Failed to delete task'
        });
    }
};

// Get statistics

export const getTaskStats = async (req, res) => {
    try {
        const userId = req.userId;
        const [total, completed, todayCount] = await Promise.all([
            Task.countDocuments({ user: userId }),
            Task.countDocuments({ user:userId, completed:true }),
            Task.countDocuments({
                user:userId,
                completed:false,
                nextReviewDate: {
                    $gte:getToday(),
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
                todayReviews:todayCount,
                completionRate: total > 0 ? Math.round((completed / total ) * 100) : 0
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            error:'Failed to fetch statistics'
        });
    }
};
