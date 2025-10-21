import { useEffect, useState } from 'react';
import { Bell, X, CheckCircle, Trophy, MessageSquare, AlertTriangle, TrendingUp } from 'lucide-react';
import { useRealTime } from '../hooks/useRealTime';
import { useAnnouncement } from '../hooks/useAnnouncement';
import toast from 'react-hot-toast';

const LiveNotifications = () => {
  const { notifications, unreadCount, markAsRead, clearNotification, connected } = useRealTime();
  const announce = useAnnouncement();
  const [showAll, setShowAll] = useState(false);

  // Announce new notifications to screen readers
  useEffect(() => {
    if (notifications.length > 0 && !notifications[0].read) {
      const latest = notifications[0];
      announce(`New notification: ${latest.title}`, 'polite');

      // Show toast for high priority notifications
      if (latest.priority === 'high') {
        toast(latest.message, {
          icon: getNotificationIcon(latest.type),
          duration: 5000,
        });
      }
    }
  }, [notifications, announce]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'homework':
        return '📚';
      case 'achievement':
        return '🏆';
      case 'message':
        return '💬';
      case 'alert':
        return '⚠️';
      case 'leaderboard':
        return '📈';
      default:
        return '🔔';
    }
  };

  const getIconComponent = (type: string) => {
    switch (type) {
      case 'homework':
        return CheckCircle;
      case 'achievement':
        return Trophy;
      case 'message':
        return MessageSquare;
      case 'alert':
        return AlertTriangle;
      case 'leaderboard':
        return TrendingUp;
      default:
        return Bell;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'medium':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  const recentNotifications = showAll ? notifications : notifications.slice(0, 5);

  return (
    <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell className="h-6 w-6 text-primary-600" />
            {connected && (
              <span className="absolute -right-1 -top-1 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span>
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Live Notifications
          </h2>
          {unreadCount > 0 && (
            <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {connected ? (
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                Live
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-gray-400"></span>
                Connecting...
              </span>
            )}
          </span>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="py-8 text-center">
          <Bell className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            No notifications yet
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            You'll see live updates here when they arrive
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {recentNotifications.map((notification) => {
            const Icon = getIconComponent(notification.type);
            return (
              <div
                key={notification.id}
                className={`group relative rounded-lg border p-3 transition-all ${
                  notification.read
                    ? 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                    : getPriorityColor(notification.priority)
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 rounded-full p-2 ${
                      notification.type === 'homework'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                        : notification.type === 'achievement'
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600'
                        : notification.type === 'message'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                        : notification.type === 'alert'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-600'
                        : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                        {notification.title}
                      </h3>
                      <button
                        onClick={() => clearNotification(notification.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Clear notification"
                      >
                        <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                      {notification.message}
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        {formatTimestamp(notification.timestamp)}
                      </span>
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>

                  {!notification.read && (
                    <div className="h-2 w-2 rounded-full bg-primary-600 flex-shrink-0 mt-1.5"></div>
                  )}
                </div>
              </div>
            );
          })}

          {notifications.length > 5 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {showAll ? 'Show Less' : `Show All (${notifications.length})`}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}

export default LiveNotifications;
