import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { homeworkAPI } from '../../services/api';
import { BookOpen, MessageSquare, Trophy, TrendingUp } from 'lucide-react';
import FloatingStudyTimerButton from '../../components/FloatingStudyTimerButton';
import LiveNotifications from '../../components/LiveNotifications';
import LiveActivityFeed from '../../components/LiveActivityFeed';
import { useUserStats } from '../../hooks/useUserStats';

const StudentDashboard = () => {
  const [homework, setHomework] = useState<any[]>([]);
  const { stats: userStats, loading: statsLoading } = useUserStats();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const homeworkRes = await homeworkAPI.getAll().catch(() => ({ data: { homework: [] } }));
      setHomework(homeworkRes.data.homework || []);
    } catch (error) {
      console.error('Dashboard load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Homework Due', value: userStats.homeworkDue, icon: BookOpen, color: 'bg-blue-500' },
    { label: 'Completed Today', value: userStats.completedToday, icon: TrendingUp, color: 'bg-green-500' },
    { label: 'Total Points', value: userStats.totalPoints, icon: Trophy, color: 'bg-yellow-500' },
    { label: 'Your Rank', value: userStats.rank > 0 ? `#${userStats.rank}` : '-', icon: MessageSquare, color: 'bg-purple-500' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-xl shadow-lg">
        <h1 className="text-4xl font-bold">Student Dashboard</h1>
        <p className="mt-2 text-xl">Welcome back! Ready to learn today?</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
              <div className={`rounded-lg ${stat.color} p-3`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link to="/homework" className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <h3 className="font-bold text-lg">📚 My Homework</h3>
          <p className="text-sm mt-1 opacity-90">Manage your assignments</p>
        </Link>
        <Link to="/ai-chat" className="rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <h3 className="font-bold text-lg">🤖 AI Tutor</h3>
          <p className="text-sm mt-1 opacity-90">Get instant help</p>
        </Link>
        <Link to="/quiz" className="rounded-xl bg-gradient-to-r from-green-500 to-green-600 p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <h3 className="font-bold text-lg">📝 Take Quiz</h3>
          <p className="text-sm mt-1 opacity-90">Test your knowledge</p>
        </Link>
      </div>

      {/* Pending Homework */}
      <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Homework</h2>
          <Link to="/homework" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View all →
          </Link>
        </div>
        <div className="mt-4 space-y-3">
          {homework.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No homework yet. Add your first assignment!</p>
              <Link to="/homework" className="mt-4 inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700">
                Add Homework
              </Link>
            </div>
          ) : (
            homework.slice(0, 5).map((item: any) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:bg-gray-50 dark:bg-gray-900"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{item.subject}</span>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Due: {new Date(item.dueDate).toLocaleDateString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  item.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {item.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Live Updates Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <LiveNotifications />
        <LiveActivityFeed />
      </div>

      <FloatingStudyTimerButton />
    </div>
  );
};

export default StudentDashboard;
