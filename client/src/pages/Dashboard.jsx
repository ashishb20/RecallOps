import { useState,  useEffect } from "react";
import Navbar from "../components/Navbar"
import AddTaskModal from '../components/AddTaskModal'
import TaskCard from '../components/TaskCard'

import {
  getTodayReviews,
  getUpcomingReviews,
  getTaskStats,
  markAsReviewed,
  deleteTask,
} from '../services/taskService';
const Dashboard = () => {
  const [todayTasks, setTodayTasks] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, active:0, completed:0, todayReviews: 0, completeRate:0});
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');

  // fetch all data 
  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [todayData, upcomingData, statsData] = await Promise.all([
        getTodayReviews(),
        getUpcomingReviews(),
        getTaskStats()
      ]);
      setTodayTasks(todayData.tasks || []) ;
      setUpcomingTasks(upcomingData.tasks || []);
      setStats(statsData.stats || {});
    } catch (err) {
      setError(err.error || 'Failed to load data');
      console.error('Fetch error:', err);
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
            <div className="animate-spin rounded-full h-12 w-12 border-teal-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your tasks...</p>
          </div>
        </div>
      </div>
    );
  }
  

}

export default Dashboard;