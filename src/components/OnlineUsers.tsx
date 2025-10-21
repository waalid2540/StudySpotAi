import { Users, Circle } from 'lucide-react';
import { useRealTime } from '../hooks/useRealTime';

const OnlineUsers = () => {
  const { onlineUsers, connected } = useRealTime();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'away':
        return 'Away';
      case 'offline':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  const formatLastSeen = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 1000 / 60);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const onlineCount = onlineUsers.filter((u) => u.status === 'online').length;
  const awayCount = onlineUsers.filter((u) => u.status === 'away').length;

  return (
    <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-primary-600" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Who's Online
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {connected ? (
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                Connected
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

      <div className="mb-4 flex gap-4 rounded-lg bg-gray-50 dark:bg-gray-900 p-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {onlineCount} Online
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {awayCount} Away
          </span>
        </div>
      </div>

      {onlineUsers.length === 0 ? (
        <div className="py-8 text-center">
          <Users className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            No users online
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {onlineUsers.map((user) => (
            <div
              key={user.userId}
              className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-3 transition-all hover:bg-gray-50 dark:hover:bg-gray-900"
            >
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 text-white font-semibold">
                  {user.userName.charAt(0)}
                </div>
                <span
                  className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-gray-800 ${getStatusColor(
                    user.status
                  )}`}
                  title={getStatusText(user.status)}
                ></span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white truncate">
                  {user.userName}
                </p>
                <div className="flex items-center gap-1">
                  <Circle
                    className={`h-2 w-2 ${
                      user.status === 'online'
                        ? 'fill-green-500 text-green-500'
                        : user.status === 'away'
                        ? 'fill-yellow-500 text-yellow-500'
                        : 'fill-gray-400 text-gray-400'
                    }`}
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {user.status === 'online'
                      ? 'Active now'
                      : user.status === 'away'
                      ? 'Away'
                      : `Last seen ${formatLastSeen(user.lastSeen)}`}
                  </span>
                </div>
              </div>

              {user.status === 'online' && (
                <div className="flex-shrink-0">
                  <span className="rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-xs font-semibold text-green-700 dark:text-green-400">
                    Online
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Status updates in real-time
        </p>
      </div>
    </div>
  );
};

export default OnlineUsers;
