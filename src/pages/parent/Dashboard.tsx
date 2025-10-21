import { useState } from 'react';
import {
  User,
  TrendingUp,
  BookOpen,
  Trophy,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  MessageSquare,
  BarChart3,
  Target,
  Award,
  Activity,
} from 'lucide-react';

interface Child {
  id: string;
  name: string;
  grade: string;
  avatar?: string;
}

interface HomeworkItem {
  id: string;
  subject: string;
  title: string;
  dueDate: string;
  status: 'completed' | 'in_progress' | 'pending' | 'overdue';
  score?: number;
}

interface ActivityItem {
  id: string;
  type: 'homework' | 'quiz' | 'achievement' | 'login';
  description: string;
  timestamp: string;
  icon: typeof CheckCircle;
  color: string;
}

const ParentDashboard = () => {
  const [children] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);

  const stats = [
    {
      label: 'Homework Completion',
      value: '0%',
      change: '0%',
      trend: 'up',
      icon: CheckCircle,
      color: 'bg-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400',
    },
    {
      label: 'Average Score',
      value: '0%',
      change: '0%',
      trend: 'up',
      icon: TrendingUp,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Total Points',
      value: '0',
      change: '0',
      trend: 'up',
      icon: Trophy,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      textColor: 'text-yellow-600 dark:text-yellow-400',
    },
    {
      label: 'Study Time (Week)',
      value: '0h',
      change: '0h',
      trend: 'up',
      icon: Clock,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-600 dark:text-purple-400',
    },
  ];

  const recentHomework: HomeworkItem[] = [];
  const recentActivity: ActivityItem[] = [];

  const getStatusColor = (status: HomeworkItem['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      case 'in_progress':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
      case 'pending':
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700';
      case 'overdue':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
    }
  };

  const getStatusIcon = (status: HomeworkItem['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'pending':
        return <BookOpen className="h-5 w-5 text-gray-600" />;
      case 'overdue':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
    }
  };

  // Show empty state if no children
  if (children.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Parent Dashboard</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Monitor your child's learning progress and activities
          </p>
        </div>

        <div className="flex items-center justify-center min-h-[400px] rounded-xl bg-white dark:bg-gray-800 p-12 shadow-md">
          <div className="text-center">
            <User className="mx-auto h-16 w-16 text-gray-400" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
              No Children Added Yet
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md">
              Add your children from the Children page to start monitoring their progress and activities.
            </p>
            <a
              href="/parent/children"
              className="mt-6 inline-block rounded-lg bg-primary-600 px-6 py-2 text-white hover:bg-primary-700 transition-colors"
            >
              Add Children
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Child Selector */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Parent Dashboard</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Monitor your child's learning progress and activities
          </p>
        </div>

        {/* Child Selector */}
        <div className="relative">
          <label htmlFor="child-select" className="sr-only">
            Select child
          </label>
          <select
            id="child-select"
            value={selectedChild?.id || ''}
            onChange={(e) => {
              const child = children.find((c) => c.id === e.target.value);
              if (child) setSelectedChild(child);
            }}
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 pr-10 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {children.map((child) => (
              <option key={child.id} value={child.id}>
                {child.name} - {child.grade}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-md transition-shadow hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className={`rounded-lg p-3 ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
              </div>
              <span
                className={`text-sm font-semibold ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {stat.change}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Homework - Takes 2 columns */}
        <div className="lg:col-span-2">
          <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-md">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-primary-600" />
                Recent Homework
              </h2>
              <button className="text-sm font-medium text-primary-600 hover:text-primary-700">
                View All
              </button>
            </div>

            <div className="space-y-4">
              {recentHomework.map((homework) => (
                <div
                  key={homework.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1">{getStatusIcon(homework.status)}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {homework.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{homework.subject}</p>
                      <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Due: {new Date(homework.dueDate).toLocaleDateString()}
                        </span>
                        {homework.score && (
                          <span className="font-semibold text-green-600">
                            Score: {homework.score}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                        homework.status
                      )}`}
                    >
                      {homework.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-1">
          <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-md">
            <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary-600" />
              Recent Activity
            </h2>

            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={activity.id} className="flex gap-3">
                  <div className="relative">
                    <div
                      className={`rounded-full bg-gray-100 dark:bg-gray-700 p-2 ${activity.color}`}
                    >
                      <activity.icon className="h-4 w-4" />
                    </div>
                    {index < recentActivity.length - 1 && (
                      <div className="absolute left-1/2 top-10 h-8 w-px -translate-x-1/2 bg-gray-200 dark:bg-gray-700" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="text-sm text-gray-900 dark:text-white">{activity.description}</p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {activity.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Overview & Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Performance by Subject */}
        <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-md">
          <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary-600" />
            Performance by Subject
          </h2>

          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-gray-500 dark:text-gray-400">
                No performance data available yet
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-md">
          <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">Quick Actions</h2>

          <div className="grid gap-4">
            <button className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700">
              <MessageSquare className="h-5 w-5 text-primary-600" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Message Teachers</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Send a message or question
                </p>
              </div>
            </button>

            <button className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700">
              <Calendar className="h-5 w-5 text-primary-600" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">View Schedule</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Check upcoming assignments
                </p>
              </div>
            </button>

            <button className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700">
              <BarChart3 className="h-5 w-5 text-primary-600" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Detailed Reports</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  View comprehensive analytics
                </p>
              </div>
            </button>

            <button className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700">
              <Trophy className="h-5 w-5 text-primary-600" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Achievements</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  View badges and rewards
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
