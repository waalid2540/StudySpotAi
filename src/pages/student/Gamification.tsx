import { useEffect, useState } from 'react';
import { gamificationAPI } from '../../services/api';
import { Trophy, Award, Star, TrendingUp, Gift, Lock, CheckCircle, Crown, Medal, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
  points: number;
  earned?: boolean;
  earnedAt?: string;
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  points: number;
  level: number;
  badges: number;
}

interface Reward {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: string;
  available: boolean;
}

interface Points {
  totalPoints: number;
  level: number;
  rank: number;
  pointsToNextLevel: number;
}

const GamificationPage = () => {
  const [points, setPoints] = useState<Points | null>(null);
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'leaderboard' | 'rewards'>('overview');

  useEffect(() => {
    loadGamificationData();
  }, []);

  const loadGamificationData = async () => {
    try {
      const [pointsRes, allBadgesRes, earnedBadgesRes, leaderboardRes, rewardsRes] = await Promise.all([
        gamificationAPI.getPoints().catch(() => ({ data: { totalPoints: 0, level: 1, rank: 0, pointsToNextLevel: 100 } })),
        gamificationAPI.getAllBadges().catch(() => ({ data: { badges: [] } })),
        gamificationAPI.getEarnedBadges().catch(() => ({ data: { badges: [] } })),
        gamificationAPI.getLeaderboard().catch(() => ({ data: { leaderboard: [] } })),
        gamificationAPI.getRewards().catch(() => ({ data: { rewards: [] } })),
      ]);

      setPoints(pointsRes.data);
      setAllBadges(allBadgesRes.data.badges || []);
      setEarnedBadges(earnedBadgesRes.data.badges || []);
      setLeaderboard(leaderboardRes.data.leaderboard || []);
      setRewards(rewardsRes.data.rewards || []);
    } catch (error) {
      console.error('Failed to load gamification data:', error);
      toast.error('Failed to load gamification data');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemReward = async (rewardId: string, cost: number) => {
    if (!points || points.totalPoints < cost) {
      toast.error('Not enough points to redeem this reward');
      return;
    }

    if (!confirm('Are you sure you want to redeem this reward?')) return;

    try {
      await gamificationAPI.redeemReward(rewardId);
      toast.success('Reward redeemed successfully!');
      loadGamificationData();
    } catch (error) {
      console.error('Failed to redeem reward:', error);
      toast.error('Failed to redeem reward');
    }
  };

  const getBadgeIcon = (iconName: string) => {
    const icons: { [key: string]: any } = {
      trophy: Trophy,
      award: Award,
      star: Star,
      medal: Medal,
      crown: Crown,
      zap: Zap,
    };
    return icons[iconName] || Award;
  };

  const getRewardIcon = (iconName: string) => {
    const icons: { [key: string]: any } = {
      gift: Gift,
      trophy: Trophy,
      star: Star,
      crown: Crown,
    };
    return icons[iconName] || Gift;
  };

  const getLevelProgress = () => {
    if (!points) return 0;
    const currentLevelPoints = points.totalPoints % 100;
    return (currentLevelPoints / 100) * 100;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white p-8 rounded-xl shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          <Trophy className="h-12 w-12" />
          <div>
            <h1 className="text-4xl font-bold">Gamification Hub</h1>
            <p className="text-lg opacity-90">Track your progress, earn rewards, and compete!</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      {points && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Points</p>
                <p className="mt-2 text-3xl font-bold text-yellow-600">{points.totalPoints}</p>
              </div>
              <div className="rounded-lg bg-yellow-100 p-3">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Level</p>
                <p className="mt-2 text-3xl font-bold text-purple-600">{points.level}</p>
              </div>
              <div className="rounded-lg bg-purple-100 p-3">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Leaderboard Rank</p>
                <p className="mt-2 text-3xl font-bold text-blue-600">#{points.rank || '-'}</p>
              </div>
              <div className="rounded-lg bg-blue-100 p-3">
                <Crown className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Badges Earned</p>
                <p className="mt-2 text-3xl font-bold text-green-600">{earnedBadges.length}</p>
              </div>
              <div className="rounded-lg bg-green-100 p-3">
                <Award className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Level Progress */}
      {points && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold text-gray-900">Level {points.level} Progress</h2>
            <span className="text-sm font-medium text-gray-600">
              {points.pointsToNextLevel} points to Level {points.level + 1}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-6">
            <div
              className="bg-gradient-to-r from-purple-500 to-blue-600 h-6 rounded-full transition-all duration-500 flex items-center justify-center"
              style={{ width: `${getLevelProgress()}%` }}
            >
              <span className="text-xs font-bold text-white">{getLevelProgress().toFixed(0)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-4 px-4 font-medium transition-colors ${
            activeTab === 'overview'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('badges')}
          className={`pb-4 px-4 font-medium transition-colors ${
            activeTab === 'badges'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Badges ({earnedBadges.length}/{allBadges.length})
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`pb-4 px-4 font-medium transition-colors ${
            activeTab === 'leaderboard'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Leaderboard
        </button>
        <button
          onClick={() => setActiveTab('rewards')}
          className={`pb-4 px-4 font-medium transition-colors ${
            activeTab === 'rewards'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Rewards
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Achievements */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Achievements</h2>
            {earnedBadges.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No badges earned yet. Keep learning!</p>
            ) : (
              <div className="space-y-3">
                {earnedBadges.slice(0, 5).map((badge) => {
                  const BadgeIcon = getBadgeIcon(badge.icon);
                  return (
                    <div
                      key={badge.id}
                      className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
                    >
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center">
                        <BadgeIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">{badge.name}</h3>
                        <p className="text-sm text-gray-600">{badge.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Earned: {badge.earnedAt ? new Date(badge.earnedAt).toLocaleDateString() : 'Recently'}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-yellow-600 font-bold">
                        +{badge.points}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Performance Stats</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-medium text-gray-700">Homework Completed</span>
                </div>
                <span className="text-2xl font-bold text-blue-600">12</span>
              </div>

              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                    <Trophy className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-medium text-gray-700">Quizzes Completed</span>
                </div>
                <span className="text-2xl font-bold text-green-600">7</span>
              </div>

              <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-medium text-gray-700">Current Streak</span>
                </div>
                <span className="text-2xl font-bold text-purple-600">5 days</span>
              </div>

              <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                    <Star className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-medium text-gray-700">AI Sessions Used</span>
                </div>
                <span className="text-2xl font-bold text-orange-600">23</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Badges Tab */}
      {activeTab === 'badges' && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">All Badges</h2>
          {allBadges.length === 0 ? (
            <p className="text-gray-500 text-center py-12">No badges available yet.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {allBadges.map((badge) => {
                const BadgeIcon = getBadgeIcon(badge.icon);
                const isEarned = earnedBadges.some((b) => b.id === badge.id);
                return (
                  <div
                    key={badge.id}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      isEarned
                        ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-lg'
                        : 'border-gray-200 bg-gray-50 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center ${
                          isEarned ? 'bg-yellow-500' : 'bg-gray-300'
                        }`}
                      >
                        {isEarned ? (
                          <BadgeIcon className="h-8 w-8 text-white" />
                        ) : (
                          <Lock className="h-8 w-8 text-gray-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-1">{badge.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{badge.description}</p>
                        <p className="text-xs text-gray-500 italic">{badge.requirement}</p>
                        <div className="mt-3 flex items-center gap-2">
                          <span className="text-xs font-bold text-yellow-600">+{badge.points} pts</span>
                          {isEarned && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Earned
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Top Students</h2>
          {leaderboard.length === 0 ? (
            <p className="text-gray-500 text-center py-12">No leaderboard data available yet.</p>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry) => (
                <div
                  key={entry.userId}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                    entry.rank === 1
                      ? 'border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50'
                      : entry.rank === 2
                      ? 'border-gray-400 bg-gradient-to-r from-gray-50 to-gray-100'
                      : entry.rank === 3
                      ? 'border-orange-400 bg-gradient-to-r from-orange-50 to-yellow-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center font-bold text-white text-lg">
                    {entry.rank <= 3 ? (
                      <Crown
                        className={`h-6 w-6 ${
                          entry.rank === 1
                            ? 'text-yellow-400'
                            : entry.rank === 2
                            ? 'text-gray-300'
                            : 'text-orange-400'
                        }`}
                      />
                    ) : (
                      entry.rank
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{entry.userName || `Student ${entry.userId}`}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        {entry.points} pts
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-purple-500" />
                        Level {entry.level}
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="h-4 w-4 text-green-500" />
                        {entry.badges} badges
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-2xl font-bold text-primary-600">
                    #{entry.rank}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Rewards Tab */}
      {activeTab === 'rewards' && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Rewards Store</h2>
            <div className="flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-lg">
              <Star className="h-5 w-5 text-yellow-600" />
              <span className="font-bold text-yellow-600">{points?.totalPoints || 0} points</span>
            </div>
          </div>
          {rewards.length === 0 ? (
            <p className="text-gray-500 text-center py-12">No rewards available yet.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rewards.map((reward) => {
                const RewardIcon = getRewardIcon(reward.icon);
                const canAfford = (points?.totalPoints || 0) >= reward.cost;
                return (
                  <div
                    key={reward.id}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      reward.available && canAfford
                        ? 'border-green-400 bg-gradient-to-br from-green-50 to-blue-50 shadow-md hover:shadow-lg'
                        : 'border-gray-200 bg-gray-50 opacity-60'
                    }`}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div
                        className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                          reward.available && canAfford ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        {reward.available && canAfford ? (
                          <RewardIcon className="h-8 w-8 text-white" />
                        ) : (
                          <Lock className="h-8 w-8 text-gray-500" />
                        )}
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2">{reward.name}</h3>
                      <p className="text-sm text-gray-600 mb-4">{reward.description}</p>
                      <div className="flex items-center gap-2 mb-4">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <span className="font-bold text-lg text-gray-900">{reward.cost} points</span>
                      </div>
                      <button
                        onClick={() => handleRedeemReward(reward.id, reward.cost)}
                        disabled={!reward.available || !canAfford}
                        className={`w-full py-2 rounded-lg font-medium transition-colors ${
                          reward.available && canAfford
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {!reward.available
                          ? 'Not Available'
                          : !canAfford
                          ? 'Not Enough Points'
                          : 'Redeem'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GamificationPage;
