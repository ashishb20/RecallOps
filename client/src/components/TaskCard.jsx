import React from 'react';

const TaskCard = ({ task, onMarkReviewed, onDelete, onEdit, isUpcoming = false }) => {
  // Format dates safely
  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Spaced Repetition Logic: Stage colors
  const getStageColor = (stage) => {
    const colors = {
      0: 'bg-red-100 text-red-700 border-red-200',    // New
      1: 'bg-orange-100 text-orange-700 border-orange-200', // Learning
      2: 'bg-yellow-100 text-yellow-700 border-yellow-200', // Reviewing
      3: 'bg-green-100 text-green-700 border-green-200',   // Mastery
    };
    return colors[stage] || 'bg-gray-100 text-gray-700';
  };

  // Calculate revision dates based on creation date and current task state
  const getRevisionTimeline = () => {
    const created = new Date(task.createdAt);
    const intervals = [1, 4, 7]; // Days 1, 4, and 7

    return intervals.map((days, index) => {
      // Base projection from creation
      let date = new Date(created);
      date.setDate(date.getDate() + days);

      // Determine status
      const isPast = index < task.reviewStage;
      const isCurrent = index === task.reviewStage;
      const isFuture = index > task.reviewStage;

      // Ground truth for the actual next review date
      if (isCurrent && task.nextReviewDate) {
        date = new Date(task.nextReviewDate);
      }

      // Ground truth for the last completed review
      if (isPast && index === task.reviewStage - 1 && task.lastReviewedAt) {
        date = new Date(task.lastReviewedAt);
      }

      return {
        label: `Rev ${index + 1}`,
        date: date,
        isPast,
        isCurrent,
        isFuture,
        dayLabel: `Day ${days}`
      };
    });
  };

  const timeline = getRevisionTimeline();

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200 group">
      <div className="flex justify-between items-start mb-3">
        <div className="flex flex-col gap-1">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border self-start ${getStageColor(task.reviewStage)}`}>
            Stage {task.reviewStage ?? 0}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Edit Action */}
          {onEdit && (
            <button
              onClick={() => onEdit(task)}
              className="text-gray-400 hover:text-teal-500 transition-colors opacity-0 group-hover:opacity-100"
              title="Edit task"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          {/* Delete Action */}
          <button
            onClick={() => onDelete(task._id)}
            className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
            title="Delete task"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <h3 className="text-lg font-bold text-gray-800 mb-4 leading-tight">
        {task.title}
      </h3>

      {/* Revision Timeline */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Revision Timeline</p>
          {isUpcoming && (
            <div className="text-[9px] text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100 uppercase tracking-wider">
              Upcoming
            </div>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {timeline.map((rev, i) => (
            <div
              key={i}
              className={`flex items-center justify-between p-2 rounded-xl border transition-all duration-300 ${rev.isCurrent
                  ? 'bg-teal-600 border-teal-700 shadow-lg shadow-teal-100'
                  : rev.isPast
                    ? 'bg-gray-50 border-gray-100 opacity-60'
                    : 'bg-white border-gray-100'
                }`}
            >
              <div className="flex flex-col">
                <span className={`text-[11px] font-bold leading-tight ${rev.isCurrent ? 'text-white' : 'text-gray-700'
                  }`}>
                  {formatDate(rev.date).split(',')[0]}
                </span>
                {rev.isCurrent && (
                  <span className="text-[7px] font-bold text-white/70 uppercase tracking-tighter">Next Review</span>
                )}
              </div>

              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold border ${rev.isCurrent
                  ? 'bg-white/20 border-white/30 text-white'
                  : rev.isPast
                    ? 'bg-green-100 border-green-200 text-green-600'
                    : 'bg-gray-100 border-gray-200 text-gray-400'
                }`}>
                {rev.dayLabel.split(' ')[1]}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end mt-auto">
        {!isUpcoming ? (
          <button
            onClick={() => onMarkReviewed(task._id)}
            className="bg-teal-600 text-white hover:bg-teal-700 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Review Now
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default TaskCard;