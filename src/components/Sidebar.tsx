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
} from 'lucide-react';
import { cn } from '../utils/cn';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const navItems = [
    { to: '/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/homework', icon: BookOpen, label: 'Homework' },
    { to: '/ai-chat', icon: MessageSquare, label: 'AI Tutor' },
    { to: '/quiz', icon: Trophy, label: 'Quizzes' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/gamification', icon: Award, label: 'Rewards' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

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
          'fixed inset-y-0 left-0 z-30 w-64 transform bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 hover:bg-gray-100 lg:hidden"
          aria-label="Close menu"
        >
          <X className="h-6 w-6 text-gray-600" />
        </button>

        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-6">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-600 to-secondary-600" />
          <span className="text-xl font-bold text-gray-900">LearningHub</span>
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
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Points Display */}
        <div className="border-t border-gray-200 p-4">
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
