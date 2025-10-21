import { useEffect } from 'react';
import { Activity, CheckCircle, Award, LogIn, BookOpen } from 'lucide-react';
import { useRealTime } from '../hooks/useRealTime';
import { useAnnouncement } from '../hooks/useAnnouncement';

const LiveActivityFeed = () => {
  const { liveActivities, connected } = useRealTime();
  const announce = useAnnouncement();

  // Announce new activities to screen readers
  useEffect(() => {
    if (liveActivities.length > 0) {
      const latest = liveActivities[0];
      announce(`${latest.userName} ${latest.action}`, 'polite');
    }
  }, [liveActivities, announce]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'homework_completed':
        return CheckCircle;
      case 'quiz_taken':
        return BookOpen;
      case 'badge_earned':
        return Award;
      case 'login':
        return LogIn;
      default:
        return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'homework_completed':
        return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
      case 'quiz_taken':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
      case 'badge_earned':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400';
      case 'login':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400';
    }
  };

  const recentActivities = liveActivities.slice(0, 10);

  return (
    <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary-600" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Live Activity Feed
          </h2>
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

      {liveActivities.length === 0 ? (
        <div className="py-8 text-center">
          <Activity className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            No recent activity
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Activity from other students will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {recentActivities.map((activity, index) => {
            const Icon = getActivityIcon(activity.type);
            const isNew = index === 0;

            return (
              <div
                key={activity.id}
                className={`flex items-start gap-3 rounded-lg border p-3 transition-all ${
                  isNew
                    ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800 animate-fade-in'
                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className={`mt-0.5 rounded-full p-2 ${getActivityColor(activity.type)}`}>
                  <Icon className="h-4 w-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white">
                    <span className="font-semibold">{activity.userName}</span>{' '}
                    <span className="text-gray-600 dark:text-gray-400">{activity.action}</span>
                  </p>
                  <span className="text-xs text-gray-500 dark:text-gray-500">
                    {formatTimestamp(activity.timestamp)}
                  </span>
                </div>

                {isNew && (
                  <span className="flex-shrink-0 rounded-full bg-primary-600 px-2 py-0.5 text-xs font-semibold text-white">
                    New
                  </span>
                )}
              </div>
            );
          })}
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

  if (seconds < 10) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;
  if (minutes < 60) return `${minutes}m ago`;
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default LiveActivityFeed;
