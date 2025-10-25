import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, User, LogOut, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';
import NotificationsCenter from './NotificationsCenter';
import SearchBar from './SearchBar';
import { messagingAPI } from '../services/api';

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar = ({ onMenuClick }: NavbarProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  // Load unread messages count
  useEffect(() => {
    loadUnreadCount();

    // Poll for updates every 10 seconds
    const interval = setInterval(() => {
      loadUnreadCount();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const response = await messagingAPI.getUnreadCount();
      setUnreadMessagesCount(response.data.unreadCount);
    } catch (error) {
      // Silently fail - don't show error toasts for background updates
      console.error('Error loading unread count:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully!');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Left: Menu & Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="h-6 w-6 text-gray-600 dark:text-gray-400 dark:text-gray-300" />
          </button>
          <div className="hidden items-center gap-2 lg:flex">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-600 to-secondary-600" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">LearningHub</span>
          </div>
        </div>

        {/* Center: Search (hidden on mobile) */}
        <div className="hidden flex-1 max-w-xl px-8 md:block">
          <SearchBar />
        </div>

        {/* Right: Notifications & Profile */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          <button
            onClick={() => setShowNotifications(true)}
            className="relative rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Notifications"
          >
            <Bell className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            {unreadMessagesCount > 0 && (
              <span className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-error-500 flex items-center justify-center text-xs text-white font-bold">
                {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
              </span>
            )}
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="User menu"
            >
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="h-8 w-8 rounded-full" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
              )}
              <span className="hidden font-medium text-gray-700 dark:text-gray-200 md:block">
                {user?.displayName || user?.email?.split('@')[0]}
              </span>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-20">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.displayName || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                    <p className="text-xs text-primary-600 font-medium mt-1 capitalize">
                      {user?.role}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/profile');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <Settings className="h-4 w-4" />
                    Profile Settings
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Notifications Center */}
      <NotificationsCenter
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </header>
  );
};

export default Navbar;
