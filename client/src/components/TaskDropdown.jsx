import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllTasks } from '../services/taskService';
import { useAuth } from '../hooks/useAuth';

const formatDate = (dateString) => {
  if (!dateString) return 'Not set';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const getRevisionTimeline = (task) => {
  const created = new Date(task.createdAt);
  const intervals = [1, 4, 7];

  return intervals.map((days, index) => {
    let date = new Date(created);
    date.setDate(date.getDate() + days);

    const isPast = index < task.reviewStage;
    const isCurrent = index === task.reviewStage;
    const isFuture = index > task.reviewStage;

    if (isCurrent && task.nextReviewDate) date = new Date(task.nextReviewDate);
    if (isPast && index === task.reviewStage - 1 && task.lastReviewedAt)
      date = new Date(task.lastReviewedAt);

    return { label: `Rev ${index + 1}`, dayLabel: `Day ${days}`, date, isPast, isCurrent, isFuture };
  });
};

const stageColors = {
  0: { dot: 'bg-red-400', badge: 'bg-red-100 text-red-700' },
  1: { dot: 'bg-orange-400', badge: 'bg-orange-100 text-orange-700' },
  2: { dot: 'bg-yellow-400', badge: 'bg-yellow-100 text-yellow-700' },
  3: { dot: 'bg-green-400', badge: 'bg-green-100 text-green-700' },
};

/* single task row */
const TaskRow = ({ task }) => {
  const [open, setOpen] = useState(false);
  const timeline = getRevisionTimeline(task);
  const stage = task.reviewStage ?? 0;
  const colors = stageColors[stage] || stageColors[0];

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden mb-2 last:mb-0">
      {/* header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
      >
        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${colors.dot}`} />
        <span className="flex-1 text-sm font-semibold text-gray-800 truncate">{task.title}</span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${colors.badge}`}>
          S{stage}
        </span>
        {/* chevron */}
        <svg
          className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* expanded revision dates */}
      {open && (
        <div className="px-4 pb-4 pt-1 bg-gray-50">
          <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-2">
            1-4-7 Revision Schedule
          </p>
          <div className="grid grid-cols-3 gap-2">
            {timeline.map((rev, i) => (
              <div
                key={i}
                className={`rounded-xl p-2.5 border text-center flex flex-col items-center gap-1 transition-all ${rev.isCurrent
                    ? 'bg-teal-600 border-teal-700 shadow-md shadow-teal-100'
                    : rev.isPast
                      ? 'bg-white border-gray-100 opacity-60'
                      : 'bg-white border-gray-100'
                  }`}
              >
                {/* day badge */}
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${rev.isCurrent
                      ? 'bg-white/20 text-white'
                      : rev.isPast
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                >
                  {rev.dayLabel}
                </span>

                {/* date */}
                <span
                  className={`text-[11px] font-bold leading-tight ${rev.isCurrent ? 'text-white' : 'text-gray-700'
                    }`}
                >
                  {formatDate(rev.date)}
                </span>

                {/* status label */}
                <span
                  className={`text-[8px] uppercase tracking-wider font-semibold ${rev.isCurrent
                      ? 'text-white/70'
                      : rev.isPast
                        ? 'text-green-500'
                        : 'text-gray-350'
                    }`}
                >
                  {rev.isCurrent ? 'Next' : rev.isPast ? '✓ Done' : 'Upcoming'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* main dropdown  */
const TaskDropdown = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  const [open, setOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  /* close on outside click */
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* fetch tasks when opened */
  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllTasks();
      setTasks(data?.tasks || data || []);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleToggle = () => {
    if (!open) loadTasks();
    setOpen((v) => !v);
    setSearch('');
  };

  const filtered = tasks.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase())
  );

  /* avatar initials */
  const initials = (user?.username || 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div ref={ref} className="relative">
      {/* ── trigger button ── */}
      <button
        id="task-dropdown-trigger"
        onClick={handleToggle}
        className={`
          w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
          bg-gradient-to-br from-teal-500 to-teal-600 text-white
          shadow-md hover:shadow-lg hover:scale-105 active:scale-95
          transition-all duration-200 relative
          ${open ? 'ring-2 ring-teal-400 ring-offset-2' : ''}
        `}
        title="All Tasks"
        aria-haspopup="true"
        aria-expanded={open}
      >
        {initials}
        {/* task count badge */}
        {tasks.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
            {tasks.length > 99 ? '99+' : tasks.length}
          </span>
        )}
      </button>

      {/* dropdown panel  */}
      {open && (
        <div
          id="task-dropdown-panel"
          className="
            absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100
            z-50 overflow-hidden
            animate-in fade-in slide-in-from-top-2 duration-150
          "
          style={{ maxHeight: '480px' }}
        >
          {/* header */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-white font-bold text-sm">All Tasks</p>
              <p className="text-white/70 text-[10px]">{tasks.length} total</p>
            </div>
            <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-xs">
              {initials}
            </div>
          </div>

          {/* search */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                id="task-dropdown-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tasks…"
                className="w-full text-xs pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
          </div>

          {/* task list */}
          <div className="overflow-y-auto px-4 py-3" style={{ maxHeight: '320px' }}>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-3xl mb-2">📭</div>
                <p className="text-xs text-gray-400 font-medium">
                  {search ? 'No matching tasks' : 'No tasks yet'}
                </p>
              </div>
            ) : (
              filtered.map((task) => <TaskRow key={task._id} task={task} />)
            )}
          </div>

          {/* footer */}
          <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
            <p className="text-[10px] text-gray-400 mb-2.5">
              Stages: <span className="text-red-400">■</span> New&nbsp;
              <span className="text-orange-400">■</span> Learning&nbsp;
              <span className="text-yellow-400">■</span> Review&nbsp;
              <span className="text-green-400">■</span> Mastered
            </p>
            <button
              id="task-dropdown-logout"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs rounded-xl border border-red-100 transition-colors duration-150 active:scale-95"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDropdown;
