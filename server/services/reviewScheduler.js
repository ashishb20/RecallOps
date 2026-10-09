import { addDays } from '../utils/dateHelper.js';

export const REVIEW_INTERVALS = [1, 4, 7];

export const getNextInterval = (currentStage) => {
  if (currentStage >= REVIEW_INTERVALS.length) return null;
  return REVIEW_INTERVALS[currentStage];
};

export const calculateNextReviewDate = (createdAt, currentStage) => {
  if (currentStage >= REVIEW_INTERVALS.length) return null;
  const daysToAdd = REVIEW_INTERVALS[currentStage];
  return addDays(createdAt, daysToAdd);
};

export const advanceStage = (task) => {
  const nextStage = task.reviewStage + 1;
  const nextReviewDate = calculateNextReviewDate(task.createdAt, nextStage);
  const completed = nextStage >= REVIEW_INTERVALS.length;

  return {
    reviewStage: nextStage,
    nextReviewDate: completed ? null : nextReviewDate,
    completed,
    reviewCount: task.reviewCount + 1,
    lastReviewedAt: new Date(),
  };
};

export const isReviewDue = (task, date = new Date()) => {
  if (task.completed || !task.nextReviewDate) return false;
  return task.nextReviewDate <= date;
};

export const getTasksDueForReview = (tasks, date = new Date()) => {
  return tasks.filter(task => isReviewDue(task, date));
};