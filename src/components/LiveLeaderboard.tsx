import { useState, useEffect } from 'react';
import { Trophy, TrendingUp, TrendingDown, Minus, Crown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LeaderboardEntry {
  userId: string;
  userName: string;
  points: number;
  rank: number;
  previousRank: number;
  avatar?: string;
}

const LiveLeaderboard = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([
    { userId: '1', userName: 'Alex Brown', points: 2500, rank: 1, previousRank: 1 },
    { userId: '2', userName: 'Sarah Chen', points: 2350, rank: 2, previousRank: 3 },
    { userId: '3', userName: 'Emma Wilson', points: 2200, rank: 3, previousRank: 2 },
    { userId: '4', userName: 'Mike Johnson', points: 2100, rank: 4, previousRank: 4 },
    { userId: user?.id || '5', userName: user?.name || 'You', points: 1950, rank: 5, previousRank: 6 },
    { userId: '6', userName: 'Chris Lee', points: 1800, rank: 6, previousRank: 5 },
    { userId: '7', userName: 'Lisa Park', points: 1650, rank: 7, previousRank: 7 },
    { userId: '8', userName: 'Tom Wilson', points: 1500, rank: 8, previousRank: 8 },
  ]);

  // Simulate real-time rank changes
  useEffect(() => {
    const interval = setInterval(() => {
      setLeaderboard((prev) => {
        // Randomly update points for some users
        const updated = prev.map((entry) => ({
          ...entry,
          previousRank: entry.rank,
          points: entry.points + (Math.random() > 0.7 ? Math.floor(Math.random() * 100) : 0),
        }));

        // Sort by points and update ranks
        updated.sort((a, b) => b.points - a.points);
        updated.forEach((entry, index) => {
          entry.rank = index + 1;
        });

        return updated;
      });
    }, 8000); // Update every 8 seconds

    return () => clearInterval(interval);
  }, []);

  const getRankChange = (entry: LeaderboardEntry) => {
    const change = entry.previousRank - entry.rank;
    if (change > 0) {
      return { icon: TrendingUp, color: 'text-green-600', text: `+${change}` };
    } else if (change < 0) {
      return { icon: TrendingDown, color: 'text-red-600', text: `${change}` };
    }
    return { icon: Minus, color: 'text-gray-400', text: '' };
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600">
            <Crown className="h-4 w-4 text-white" />
          </div>
        );
      case 2:
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-500">
            <span className="text-sm font-bold text-white">2</span>
          </div>
        );
      case 3:
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600">
            <span className="text-sm font-bold text-white">3</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700">
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">{rank}</span>
          </div>
        );
    }
  };

  const topEntries = leaderboard.slice(0, 10);

  return (
    <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-600" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Live Leaderboard
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Live</span>
        </div>
      </div>

      <div className="space-y-2">
        {topEntries.map((entry, index) => {
          const rankChange = getRankChange(entry);
          const RankIcon = rankChange.icon;
          const isCurrentUser = entry.userId === user?.id;
          const rankChanged = entry.rank !== entry.previousRank;

          return (
            <div
              key={entry.userId}
              className={`flex items-center gap-3 rounded-lg border p-3 transition-all duration-500 ${
                isCurrentUser
                  ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700'
                  : rankChanged
                  ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800'
                  : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex-shrink-0">
                {getRankBadge(entry.rank)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`font-semibold text-gray-900 dark:text-white ${
                    isCurrentUser ? 'text-primary-600 dark:text-primary-400' : ''
                  }`}>
                    {entry.userName}
                    {isCurrentUser && (
                      <span className="ml-2 text-xs font-normal text-primary-600 dark:text-primary-400">
                        (You)
                      </span>
                    )}
                  </p>
                  {entry.rank <= 3 && (
                    <span className="text-xs font-semibold text-yellow-600">
                      TOP {entry.rank}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {entry.points.toLocaleString()} points
                </p>
              </div>

              {rankChange.text && (
                <div className={`flex items-center gap-1 ${rankChange.color}`}>
                  <RankIcon className="h-4 w-4" />
                  <span className="text-xs font-semibold">{rankChange.text}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {user && leaderboard.find((e) => e.userId === user.id)?.rank && leaderboard.find((e) => e.userId === user.id)!.rank > 10 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Your rank: #{leaderboard.find((e) => e.userId === user.id)?.rank} with{' '}
            {leaderboard.find((e) => e.userId === user.id)?.points.toLocaleString()} points
          </p>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Rankings update in real-time based on points earned
        </p>
      </div>
    </div>
  );
};

export default LiveLeaderboard;
