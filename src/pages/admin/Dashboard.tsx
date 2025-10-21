import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  BookOpen,
  Activity,
  TrendingUp,
  UserCheck,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  Settings
} from 'lucide-react';
import { userTrackingService } from '../../services/userTracking';

interface OnlineUser {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'parent' | 'teacher';
  status: 'online' | 'away' | 'offline';
  lastSeen: Date;
  currentPage?: string;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalHomework: 0,
    pendingSubmissions: 0,
    completedToday: 0,
    onlineNow: 0,
  });

  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();

    // Subscribe to real-time user tracking
    const unsubscribe = userTrackingService.subscribe((users) => {
      setOnlineUsers(users);
      setStats(prev => ({ ...prev, onlineNow: users.length }));
    });

    return () => unsubscribe();
  }, []);

  const loadAdminData = async () => {
    try {
      // In production, fetch from admin API
      // For now, using basic stats
      setStats({
        totalUsers: 0,
        activeUsers: 0,
        totalHomework: 0,
        pendingSubmissions: 0,
        completedToday: 0,
        onlineNow: 0,
      });

      loadRecentActivity();
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentActivity = () => {
    // Recent activity will populate when real users perform actions
    setRecentActivity([]);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'student': return 'bg-blue-100 text-blue-800';
      case 'parent': return 'bg-purple-100 text-purple-800';
      case 'teacher': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
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
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-6 rounded-xl shadow-lg">
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        <p className="mt-2 text-xl">Full System Access & Control</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
            </div>
            <div className="rounded-lg bg-blue-500 p-3">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Online Now</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.onlineNow}</p>
            </div>
            <div className="rounded-lg bg-green-500 p-3">
              <UserCheck className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.activeUsers}</p>
            </div>
            <div className="rounded-lg bg-purple-500 p-3">
              <Activity className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Homework</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.totalHomework}</p>
            </div>
            <div className="rounded-lg bg-yellow-500 p-3">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.pendingSubmissions}</p>
            </div>
            <div className="rounded-lg bg-orange-500 p-3">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed Today</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.completedToday}</p>
            </div>
            <div className="rounded-lg bg-teal-500 p-3">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          to="/admin/users"
          className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white shadow-lg hover:shadow-xl transition-shadow"
        >
          <h3 className="font-bold text-lg">Manage Users</h3>
          <p className="text-sm mt-1 opacity-90">View all users</p>
        </Link>
        <Link
          to="/admin/homework"
          className="rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-white shadow-lg hover:shadow-xl transition-shadow"
        >
          <h3 className="font-bold text-lg">All Homework</h3>
          <p className="text-sm mt-1 opacity-90">View submissions</p>
        </Link>
        <Link
          to="/admin/analytics"
          className="rounded-xl bg-gradient-to-r from-green-500 to-green-600 p-6 text-white shadow-lg hover:shadow-xl transition-shadow"
        >
          <h3 className="font-bold text-lg">Analytics</h3>
          <p className="text-sm mt-1 opacity-90">View reports</p>
        </Link>
        <Link
          to="/admin/settings"
          className="rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white shadow-lg hover:shadow-xl transition-shadow"
        >
          <h3 className="font-bold text-lg">Settings</h3>
          <p className="text-sm mt-1 opacity-90">System config</p>
        </Link>
      </div>

      {/* Online Users */}
      <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <div className="relative">
              <UserCheck className="h-6 w-6" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            Users Online Now ({stats.onlineNow})
          </h2>
          <button
            onClick={() => setOnlineUsers(userTrackingService.getOnlineUsers())}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
          >
            <Activity className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {onlineUsers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No users currently online</p>
          </div>
        ) : (
          <div className="space-y-3">
            {onlineUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(user.status)} rounded-full border-2 border-white dark:border-gray-800`}></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{user.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                    {user.currentPage && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1 mt-1">
                        <Eye className="h-3 w-3" />
                        Viewing: {user.currentPage}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                    {user.role}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {user.lastSeen.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-md">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="h-6 w-6" />
          Recent Activity
        </h2>
        <div className="space-y-3">
          {recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold">
                  {activity.user.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{activity.user}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{activity.action}</p>
                </div>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
