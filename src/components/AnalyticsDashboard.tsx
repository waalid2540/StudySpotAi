import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Award, Target, Clock, BookOpen } from 'lucide-react';

interface AnalyticsDashboardProps {
  studentName?: string;
  data: {
    performanceOverTime: Array<{ date: string; score: number }>;
    subjectPerformance: Array<{ subject: string; score: number; homework: number }>;
    weeklyActivity: Array<{ day: string; hours: number }>;
    summary: {
      totalHomework: number;
      completedHomework: number;
      averageScore: number;
      totalPoints: number;
      studyTimeHours: number;
      badges: number;
    };
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  };
}

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

const AnalyticsDashboard = ({ studentName, data }: AnalyticsDashboardProps) => {
  const { summary, performanceOverTime, subjectPerformance, weeklyActivity, strengths, weaknesses, recommendations } = data;

  const completionRate = summary.totalHomework > 0
    ? Math.round((summary.completedHomework / summary.totalHomework) * 100)
    : 0;

  const stats = [
    { label: 'Avg Score', value: `${summary.averageScore}%`, icon: Target, color: 'bg-blue-500', trend: summary.averageScore >= 80 ? 'up' : 'down' },
    { label: 'Completion', value: `${completionRate}%`, icon: BookOpen, color: 'bg-green-500', trend: completionRate >= 85 ? 'up' : 'down' },
    { label: 'Study Time', value: `${summary.studyTimeHours}h`, icon: Clock, color: 'bg-purple-500', trend: 'up' },
    { label: 'Total Points', value: summary.totalPoints, icon: Award, color: 'bg-yellow-500', trend: 'up' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      {studentName && (
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-xl">
          <h1 className="text-3xl font-bold">{studentName}'s Performance Analytics</h1>
          <p className="mt-2 opacity-90">Insights powered by AI</p>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`rounded-lg ${stat.color} p-3`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              {stat.trend === 'up' ? (
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
              )}
              <span className={stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                {stat.trend === 'up' ? 'On track' : 'Needs attention'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Performance Over Time */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Performance Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={performanceOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" style={{ fontSize: '12px' }} />
              <YAxis style={{ fontSize: '12px' }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#8b5cf6"
                strokeWidth={3}
                name="Score %"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Subject Performance */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Subject Performance</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={subjectPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject" style={{ fontSize: '12px' }} />
              <YAxis style={{ fontSize: '12px' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="score" fill="#8b5cf6" name="Score %" />
              <Bar dataKey="homework" fill="#3b82f6" name="Homework Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekly Activity & Subject Breakdown */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly Activity */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Weekly Study Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" style={{ fontSize: '12px' }} />
              <YAxis style={{ fontSize: '12px' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="hours" fill="#10b981" name="Hours Studied" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Subject Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Time by Subject</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={subjectPerformance}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => entry.subject}
                outerRadius={80}
                fill="#8884d8"
                dataKey="homework"
              >
                {subjectPerformance.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Insights */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Strengths */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
          <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Strengths
          </h3>
          <ul className="space-y-2">
            {strengths.map((strength, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-green-800">
                <span className="text-green-600 font-bold">✓</span>
                {strength}
              </li>
            ))}
          </ul>
        </div>

        {/* Areas for Improvement */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border-2 border-amber-200">
          <h3 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Areas to Improve
          </h3>
          <ul className="space-y-2">
            {weaknesses.map((weakness, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-amber-800">
                <span className="text-amber-600 font-bold">→</span>
                {weakness}
              </li>
            ))}
          </ul>
        </div>

        {/* AI Recommendations */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200">
          <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
            <Award className="h-5 w-5" />
            Recommendations
          </h3>
          <ul className="space-y-2">
            {recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-blue-800">
                <span className="text-blue-600 font-bold">💡</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
