import { useState, useEffect } from 'react';
import {
  Bell,
  X,
  Check,
  Trophy,
  BookOpen,
  Sparkles,
  AlertCircle,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface Notification {
  id: string;
  type: 'homework' | 'badge' | 'ai' | 'reminder' | 'achievement';
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: typeof Trophy;
  color: string;
}

interface NotificationsCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationsCenter = ({ isOpen, onClose }: NotificationsCenterProps) => {
  const focusTrapRef = useFocusTrap(isOpen);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'badge',
      title: 'New Badge Unlocked!',
      message: 'You earned the "Study Streak 5 Days" badge',
      time: '2 minutes ago',
      read: false,
      icon: Trophy,
      color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
    },
    {
      id: '2',
      type: 'homework',
      title: 'Homework Due Soon',
      message: 'Math homework is due in 2 hours',
      time: '1 hour ago',
      read: false,
      icon: BookOpen,
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
    },
    {
      id: '3',
      type: 'ai',
      title: 'AI Response Ready',
      message: 'Your homework solution is ready to view',
      time: '3 hours ago',
      read: false,
      icon: Sparkles,
      color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
    },
    {
      id: '4',
      type: 'achievement',
      title: '100 Points Earned!',
      message: 'You reached Level 2! Keep up the great work',
      time: '5 hours ago',
      read: true,
      icon: CheckCircle2,
      color: 'text-green-600 bg-green-100 dark:bg-green-900/30',
    },
    {
      id: '5',
      type: 'reminder',
      title: 'Study Reminder',
      message: 'Time for your daily study session',
      time: '1 day ago',
      read: true,
      icon: Clock,
      color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30',
    },
  ]);

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications =
    filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.success('Notification deleted');
  };

  const clearAll = () => {
    setNotifications([]);
    toast.success('All notifications cleared');
  };

  // Handle Escape key to close
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Notifications Panel */}
      <div
        ref={focusTrapRef}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl z-50 overflow-hidden flex flex-col animate-slide-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notifications-title"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6" aria-hidden="true" />
              <h2 id="notifications-title" className="text-2xl font-bold">Notifications</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 dark:hover:bg-white/30 rounded-lg transition-colors"
              aria-label="Close notifications"
            >
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-white text-primary-600'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-white text-primary-600'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>

        {/* Actions */}
        {notifications.length > 0 && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex gap-2">
            <button
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={`Mark all ${unreadCount} notifications as read`}
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Mark All Read
            </button>
            <button
              onClick={clearAll}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
              aria-label="Clear all notifications"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              Clear All
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <Bell className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No notifications
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {filter === 'unread'
                  ? "You're all caught up!"
                  : "You'll see notifications here"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                    !notification.read ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${notification.color}`}>
                      <notification.icon className="h-5 w-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-primary-600 flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {notification.time}
                      </p>

                      {/* Actions */}
                      <div className="flex gap-2 mt-3">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                          >
                            <Check className="h-3 w-3" />
                            Mark as read
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="text-xs flex items-center gap-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                        >
                          <X className="h-3 w-3" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationsCenter;
