import React from 'react';

const TaskCard = ({ task, onMarkReviewed, onDelete, isUpcoming = false }) => {
  // Format dates safely
  const formatDate = (dateString) => {
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

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200 group">
      <div className="flex justify-between items-start mb-3">
        {/* Stage Badge (Spaced Repetition Logic) */}
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getStageColor(task.reviewStage)}`}>
          Stage {task.reviewStage ?? 0}
        </span>
        
        {/* Delete Action  */}
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

      <h3 className="text-lg font-bold text-gray-800 mb-1 leading-tight">
        {task.title}
      </h3>
      
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {task.description || "No description provided."}
      </p>

      <div className="flex items-center justify-between mt-auto">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">
            Next Review
          </span>
          <span className="text-sm font-medium text-gray-700">
            {formatDate(task.nextReviewDate)}
          </span>
        </div>

        {/* Action Button: Only show "Review Now" if not in Upcoming column */}
        {!isUpcoming ? (
          <button
            onClick={() => onMarkReviewed(task._id)}
            className="bg-teal-50 text-teal-600 hover:bg-teal-600 hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Review Now
          </button>
        ) : (
          <div className="text-xs text-purple-500 font-semibold bg-purple-50 px-3 py-1 rounded-md">
            Scheduled
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;