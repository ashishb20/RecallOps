import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import useToast from "../hooks/useToast";
import Navbar from "../components/Navbar";
import AddTaskModal from '../components/AddTaskModal';
import TaskCard from '../components/TaskCard';
import Timer from '../components/Timer';
import ToastContainer from "../components/ToastContainer";

import {
  getDashboardData,
  markAsReviewed,
  deleteTask,
} from '../services/taskService';

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { toasts, removeToast, showSuccess, showError } = useToast();

  const [todayTasks, setTodayTasks] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0, todayReviews: 0, completionRate: 0 });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [dailyTodos, setDailyTodos] = useState(() => {
    const saved = localStorage.getItem("daily_checklist");
    return saved ? JSON.parse(saved) : [];
  });
  const [newTodo, setNewTodo] = useState("");

  useEffect(() => {
    localStorage.setItem("daily_checklist", JSON.stringify(dailyTodos));
  }, [dailyTodos]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getDashboardData();
      
      setTodayTasks(data?.todayData?.tasks || []);
      setUpcomingTasks(data?.upcomingData?.tasks || []);
      setStats(data?.statsData?.stats || { total: 0, active: 0, completed: 0, todayReviews: 0, completionRate: 0 });
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to load data');
      if (err.response?.status === 401) { logout(); navigate('/login'); }
    } finally {
      setLoading(false);
    }
  }, [logout, navigate, showError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  //  Actions 
  const handleMarkReviewed = async (taskId) => {
    try {
      await markAsReviewed(taskId);
      showSuccess('Progress saved!');
      await fetchData();
    } catch (err) {
      showError('Failed to update task.');
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await deleteTask(taskId);
      showSuccess('Task removed.');
      await fetchData();
    } catch (err) {
      showError('Delete failed.');
    }
  };

  const handleTaskAdded = () => {
    showSuccess('New task added!');
    fetchData();
  };

  // Checklist Helpers
  const addTodo = (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    setDailyTodos([...dailyTodos, { id: Date.now(), text: newTodo, completed: false }]);
    setNewTodo("");
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-12 font-sans">
      <Navbar />
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* TOP SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center min-h-[250px]">
            <h3 className="font-bold text-gray-700 mb-4 text-lg"> Focus Timer</h3>
            <Timer onTimerComplete={() => showSuccess('Focus session complete!')} />
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[250px] flex flex-col">
            <h3 className="font-bold text-gray-700 mb-4 text-lg">Daily Checklist</h3>
            <form onSubmit={addTodo} className="flex gap-2 mb-4">
              <input
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="What else to do today?"
                className="flex-1 text-sm p-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
              />
              <button type="submit" className="bg-teal-500 text-white px-4 rounded-xl font-bold">+</button>
            </form>
            <div className="space-y-2 overflow-y-auto max-h-[150px] pr-2 custom-scrollbar">
              {dailyTodos.map(t => (
                <div key={t.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg group">
                  <input
                    type="checkbox"
                    checked={t.completed}
                    onChange={() => setDailyTodos(dailyTodos.map(item => item.id === t.id ? { ...item, completed: !item.completed } : item))}
                    className="w-4 h-4 accent-teal-500"
                  />
                  <span className={`text-sm flex-1 ${t.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>{t.text}</span>
                  <button onClick={() => setDailyTodos(dailyTodos.filter(item => item.id !== t.id))} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100">✕</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ACTION BUTTON */}
        <div className="flex justify-center mb-10">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-teal-500 hover:bg-teal-600 text-white px-10 py-4 rounded-xl font-bold shadow-lg transition active:scale-95"
          >
            + Add New Learning Task
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Tasks', val: stats.total, color: 'border-teal-400' },
            { label: 'Active', val: stats.active, color: 'border-blue-400' },
            { label: 'Completed', val: stats.completed, color: 'border-green-400' },
            { label: 'Success Rate', val: `${stats.completionRate}%`, color: 'border-purple-400' }
          ].map((item, i) => (
            <div key={i} className={`bg-white rounded-xl p-6 shadow-sm border-b-4 ${item.color}`}>
              <p className="text-xs text-gray-400 font-bold uppercase">{item.label}</p>
              <p className="text-2xl font-bold text-gray-800">{item.val}</p>
            </div>
          ))}
        </div>

        {/* COLUMNS  */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-teal-600 p-4 text-white flex justify-between">
              <h2 className="font-bold">Today's Reviews</h2>
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{todayTasks.length}</span>
            </div>
            <div className="p-5 h-[500px] overflow-y-auto space-y-4">
              {todayTasks.map(task => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onMarkReviewed={handleMarkReviewed}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-purple-700 p-4 text-white flex justify-between">
              <h2 className="font-bold">Upcoming Reviews</h2>
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{upcomingTasks.length}</span>
            </div>
            <div className="p-5 h-[500px] overflow-y-auto space-y-4">
              {upcomingTasks.map(task => (
                <TaskCard
                  key={task._id}
                  task={task}
                  isUpcoming={true}
                  onMarkReviewed={handleMarkReviewed}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      <AddTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onTaskAdded={handleTaskAdded} />
    </div>
  );
};

export default Dashboard;