import { useState } from 'react';
import {
  Download,
  FileText,
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Award,
  BookOpen,
  Clock,
  Target,
  Filter,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart as RePieChart,
  Pie,
  Cell,
} from 'recharts';
import toast from 'react-hot-toast';

interface Child {
  id: string;
  name: string;
  grade: string;
}

const ParentReports = () => {
  const [children] = useState<Child[]>([]);

  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'semester' | 'year'>('month');

  // Performance over time data
  const performanceData: any[] = [];

  // Study time data
  const studyTimeData: any[] = [];

  // Subject distribution
  const subjectData: any[] = [];

  // Homework completion rate
  const homeworkData: any[] = [];

  const stats = [
    {
      label: 'Overall Average',
      value: '0%',
      change: '0%',
      trend: 'up' as const,
      icon: TrendingUp,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      label: 'Homework Completion',
      value: '0%',
      change: '0%',
      trend: 'up' as const,
      icon: BookOpen,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Study Hours (Week)',
      value: '0h',
      change: '0h',
      trend: 'up' as const,
      icon: Clock,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      label: 'Achievements',
      value: '0',
      change: '0',
      trend: 'up' as const,
      icon: Award,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    },
  ];

  const strengths: any[] = [];

  const areasForImprovement: any[] = [];

  const handleDownloadReport = () => {
    toast.success('Report downloaded successfully!');
  };

  const handleExportPDF = () => {
    toast.success('Exporting report as PDF...');
  };

  // Show empty state if no children
  if (children.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Progress Reports</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Detailed analytics and performance tracking
          </p>
        </div>

        <div className="flex items-center justify-center min-h-[400px] rounded-xl bg-white dark:bg-gray-800 p-12 shadow-md">
          <div className="text-center">
            <BarChart3 className="mx-auto h-16 w-16 text-gray-400" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
              No Children Added Yet
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md">
              Add your children from the Children page to view their progress reports and analytics.
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
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Progress Reports</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Detailed analytics and performance tracking
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Child Selector */}
          <select
            value={selectedChild?.id || ''}
            onChange={(e) => {
              const child = children.find((c) => c.id === e.target.value);
              if (child) setSelectedChild(child);
            }}
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {children.map((child) => (
              <option key={child.id} value={child.id}>
                {child.name}
              </option>
            ))}
          </select>

          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="semester">This Semester</option>
            <option value="year">This Year</option>
          </select>

          {/* Download Button */}
          <button
            onClick={handleExportPDF}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 transition-colors"
          >
            <Download className="h-5 w-5" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-md transition-shadow hover:shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`rounded-lg p-3 ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <span
                className={`text-sm font-semibold ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {stat.change}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Performance Over Time */}
        <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-md">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary-600" />
              Performance Trends
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis dataKey="name" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="Math" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="Science" stroke="#10B981" strokeWidth={2} />
              <Line type="monotone" dataKey="English" stroke="#8B5CF6" strokeWidth={2} />
              <Line type="monotone" dataKey="History" stroke="#F59E0B" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Study Time */}
        <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-md">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="h-6 w-6 text-primary-600" />
              Weekly Study Time
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={studyTimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis dataKey="day" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Bar dataKey="hours" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Subject Distribution */}
        <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-md">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <PieChart className="h-6 w-6 text-primary-600" />
              Study Time by Subject
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RePieChart>
              <Pie
                data={subjectData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {subjectData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </RePieChart>
          </ResponsiveContainer>
        </div>

        {/* Homework Completion */}
        <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-md">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Target className="h-6 w-6 text-primary-600" />
              Homework Completion Rate
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={homeworkData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis dataKey="month" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="completed"
                stackId="1"
                stroke="#10B981"
                fill="#10B981"
              />
              <Area type="monotone" dataKey="pending" stackId="1" stroke="#EF4444" fill="#EF4444" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Strengths and Areas for Improvement */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Strengths */}
        <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-md">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-green-600" />
            Top Strengths
          </h2>
          <div className="space-y-4">
            {strengths.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {item.subject}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                        {item.improvement}
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white">{item.score}%</span>
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-2 rounded-full bg-green-500"
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Areas for Improvement */}
        <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-md">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Target className="h-6 w-6 text-orange-600" />
            Areas for Improvement
          </h2>
          <div className="space-y-4">
            {areasForImprovement.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {item.subject}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-semibold ${
                          item.change.startsWith('+')
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {item.change}
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white">{item.score}%</span>
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-2 rounded-full bg-orange-500"
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-md">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary-600" />
          Generated Reports
        </h2>
        <div className="space-y-3">
          {[
            { name: 'Monthly Progress Report - December 2024', date: '2024-12-01', size: '2.4 MB' },
            { name: 'Semester Report - Fall 2024', date: '2024-11-15', size: '4.1 MB' },
            { name: 'Mid-Term Performance Report', date: '2024-10-30', size: '1.8 MB' },
          ].map((report, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary-50 dark:bg-primary-900/20 p-2">
                  <FileText className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{report.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(report.date).toLocaleDateString()} • {report.size}
                  </p>
                </div>
              </div>
              <button
                onClick={handleDownloadReport}
                className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ParentReports;
