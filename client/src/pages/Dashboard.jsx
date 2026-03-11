import { useState,  useEffect } from "react";
import Navbar from "../components/Navbar"
import AddTaskModal from '../components/AddTaskModal'
import TaskCard from '../components/TaskCard'

import {
  getTodayReviews,
  getUpcomingReviews,
  getTaskStats,
  markAsReviewed,
  deleteTask
} from '../services/taskService';
const Dashboard = () => {
  const [todayTasks, setTodayTasks] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, active:0, completed:0, todayReviews: 0, completionRate:0});
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');

  // fetch all data 
  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      // Check for authenticated user
      const token = localStorage.getItem('token');
      if(!token) {
        localStorage.clear();
        window.location.href = '/login';
        return ;
      }
      
      const [todayData, upcomingData, statsData] = await Promise.all([
        getTodayReviews(),
        getUpcomingReviews(),
        getTaskStats()
      ]);
      // 
      setTodayTasks(todayData?.tasks || []);
      setUpcomingTasks(upcomingData?.tasks || []);
      setStats(statsData?.stats || {total: 0, active: 0, completed: 0, todayReviews: 0, completionRate: 0});

    } catch (err) {
      console.error('Fetch error:', err);
      const errorMessage = err.error || err.message || 'Failed  to load data' ;
      setError(errorMessage);
      if(err.status === 401 || errorMessage === 'Not authenticated' || errorMessage.includes('401')) {
        localStorage.clear();
        window.location.href = '/login' ;
      }
    } finally {
      setLoading(false);
    }
  };
  // Load data 
  useEffect(() => {
    fetchData();
  }, []);
  // handle mark as reviewed 
  const handleMarkReviewed = async (taskId) => {
    try {
      await markAsReviewed(taskId);
      fetchData();
    } catch (err) {
      alert(err.error || 'Failed to mark as reviewed');
    }
  };
  // handle delete
  const handleDelete = async (taskId) => {
    try {
      await deleteTask(taskId);
      fetchData();
    } catch (err) {
      alert(err.error || 'Failed to delete task');
    }
  };
  // handle task added
  const handleTaskAdded = () => {
    fetchData();
  };
  if(loading) {
    return(
      <div className="min-h-screen bg-gray-50">
        <Navbar /> ;
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your tasks...</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Add Task Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add New Learning Task</span>
          </button>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Tasks</p>
                <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Active</p>
                <p className="text-3xl font-bold text-gray-800">{stats.active}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Completed</p>
                <p className="text-3xl font-bold text-gray-800">{stats.completed}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Success Rate</p>
                <p className="text-3xl font-bold text-gray-800">{stats.completionRate}%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Today's Reviews */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-teal-500 to-blue-500 p-6">
              <div className="flex justify-between items-start">
                <div className="text-white">
                  <h2 className="text-2xl font-bold mb-2">Today's Reviews</h2>
                  <p className="text-teal-100 text-sm">Tasks that need your attention now</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">{todayTasks.length}</span>
                </div>
              </div>
            </div>

            <div className="p-6">
              {todayTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <svg className="w-20 h-20 text-teal-200 mb-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No reviews due today! 🎉</h3>
                  <p className="text-gray-500 text-sm">Keep learning to build your review queue</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {todayTasks.map(task => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onMarkReviewed={handleMarkReviewed}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Reviews */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6">
              <div className="flex justify-between items-start">
                <div className="text-white">
                  <h2 className="text-2xl font-bold mb-2">Upcoming Reviews</h2>
                  <p className="text-purple-100 text-sm">Scheduled for future dates</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">{upcomingTasks.length}</span>
                </div>
              </div>
            </div>

            <div className="p-6">
              {upcomingTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <svg className="w-20 h-20 text-purple-200 mb-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No upcoming reviews</h3>
                  <p className="text-gray-500 text-sm">Add new tasks to get started!</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {upcomingTasks.map(task => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onMarkReviewed={handleMarkReviewed}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTaskAdded={handleTaskAdded}
      />
    </div>
  );

}

export default Dashboard;

