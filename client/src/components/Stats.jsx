// StatsBar shows the four key numbers at a glance on the dashboard.
const StatsBar = ({ stats }) => {
  if (!stats) return null;

  const cards = [
    {
      emoji: '🔥',
      value: stats.dueTodayCount,
      label: 'Due Today',
      valueColor: stats.dueTodayCount > 0 ? 'text-red-400' : 'text-slate-400',
    },
    {
      emoji: '📋',
      value: stats.activeTasks,
      label: 'Active',
      valueColor: 'text-blue-400',
    },
    {
      emoji: '✅',
      value: stats.completedTasks,
      label: 'Mastered',
      valueColor: 'text-primary-400',
    },
    {
      emoji: '🧠',
      value: stats.reviewsThisWeek,
      label: 'Reviews (7d)',
      valueColor: 'text-secondary-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {cards.map(({ emoji, value, label, valueColor }) => (
        <div
          key={label}
          className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center"
        >
          <div className="text-2xl mb-1">{emoji}</div>
          <div className={`text-2xl font-bold ${valueColor}`}>{value ?? 0}</div>
          <div className="text-slate-500 text-xs mt-0.5">{label}</div>
        </div>
      ))}
    </div>
  );
};

export default StatsBar;