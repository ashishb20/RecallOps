
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import TaskDropdown from './TaskDropdown';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">RecallOps</h1>
              <p className="text-xs text-gray-500">1-4-7 Learning Method</p>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-3">
            {/* User Info */}
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">{user?.username}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            {import.meta.env.VITE_NOTIFICATION_API_URL && (
              <NotificationBell userId={user?._id || user?.id} />
            )}
            <TaskDropdown />

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;