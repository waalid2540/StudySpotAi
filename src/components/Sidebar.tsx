import { NavLink } from 'react-router-dom';
import {
  Home,
  BookOpen,
  MessageSquare,
  Trophy,
  User,
  Award,
  X,
  BarChart3,
  Users,
  CreditCard,
  Settings,
  Bell,
  Shield,
  Activity,
  FileText,
} from 'lucide-react';
import { cn } from '../utils/cn';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { user } = useAuth();

  // Student navigation
  const studentNavItems = [
    { to: '/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/homework', icon: BookOpen, label: 'Homework' },
    { to: '/ai-chat', icon: MessageSquare, label: 'AI Tutor' },
    { to: '/quiz', icon: Trophy, label: 'Quizzes' },
    { to: '/gamification', icon: Award, label: 'Rewards' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  // Parent navigation
  const parentNavItems = [
    { to: '/parent-dashboard', icon: Home, label: 'Dashboard' },
    { to: '/parent/children', icon: Users, label: 'My Children' },
    { to: '/parent/messages', icon: MessageSquare, label: 'Messages' },
    { to: '/parent/reports', icon: BarChart3, label: 'Reports' },
    { to: '/parent/billing', icon: CreditCard, label: 'Billing' },
    { to: '/parent/settings', icon: Settings, label: 'Settings' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  // Admin navigation
  const adminNavItems = [
    { to: '/admin-dashboard', icon: Home, label: 'Dashboard' },
    { to: '/admin/users', icon: Users, label: 'All Users' },
    { to: '/admin/homework', icon: BookOpen, label: 'All Homework' },
    { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/admin/settings', icon: Settings, label: 'Settings' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  // Select navigation based on user role
  const getNavItems = () => {
    switch (user?.role) {
      case 'admin':
        return adminNavItems;
      case 'parent':
        return parentNavItems;
      case 'student':
      default:
        return studentNavItems;
    }
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 w-64 transform bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
          aria-label="Close menu"
        >
          <X className="h-6 w-6 text-gray-600 dark:text-gray-400" />
        </button>

        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-gray-200 dark:border-gray-700 px-6">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-600 to-secondary-600" />
          <div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">LearningHub</span>
            {user?.role && (
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role} Portal</p>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Points Display */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="rounded-lg bg-gradient-to-r from-primary-500 to-secondary-500 p-4 text-white">
            <div className="text-sm font-medium">Your Points</div>
            <div className="mt-1 text-2xl font-bold">1,250</div>
            <div className="mt-2 text-xs opacity-90">Keep learning to earn more!</div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
