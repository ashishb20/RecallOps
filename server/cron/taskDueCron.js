import Task from '../models/Task.js';
import { sendNotificationEvent } from '../utils/notificationClient.js';

export const checkAndDispatchDueTasks = async (logger = console) => {
  try {
    const now = new Date();
    const dueTasks = await Task.find({
      completed: false,
      nextReviewDate: { $lte: now },
    }).populate('user', 'username email');

    if (!dueTasks.length) {
      return 0;
    }

    if (logger.info) {
      logger.info({ count: dueTasks.length }, 'Found due tasks to notify');
    }

    let dispatched = 0;
    for (const task of dueTasks) {
      if (!task.user || !task.user.email) continue;

      const sent = await sendNotificationEvent({
        eventType: 'TASK_DUE_TODAY',
        entityId: task._id.toString(),
        userId: task.user._id.toString(),
        userEmail: task.user.email,
        payload: {
          name: task.user.username,
          taskTitle: task.title,
          stage: String(task.reviewStage),
          reviewUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/review/${task._id}`,
        },
      }, logger);

      if (sent) dispatched++;
    }

    return dispatched;
  } catch (err) {
    if (logger.error) {
      logger.error({ error: err.message }, 'Failed running task due notification check');
    }
    return 0;
  }
};

export const startDueTasksScheduler = (logger = console, intervalMs = 60 * 60 * 1000) => {
  // Initial check after 10s
  setTimeout(() => checkAndDispatchDueTasks(logger), 10000);
  // Recurring check
  const timer = setInterval(() => checkAndDispatchDueTasks(logger), intervalMs);
  return timer;
};
