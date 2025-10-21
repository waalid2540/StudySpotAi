import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AnalyticsDashboard from '../../components/AnalyticsDashboard';
import { Loader2 } from 'lucide-react';

const Analytics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // Mock data - in production, this would come from API
  const analyticsData = {
    performanceOverTime: [],
    subjectPerformance: [],
    weeklyActivity: [
      { day: 'Mon', hours: 0 },
      { day: 'Tue', hours: 0 },
      { day: 'Wed', hours: 0 },
      { day: 'Thu', hours: 0 },
      { day: 'Fri', hours: 0 },
      { day: 'Sat', hours: 0 },
      { day: 'Sun', hours: 0 },
    ],
    summary: {
      totalHomework: 0,
      completedHomework: 0,
      averageScore: 0,
      totalPoints: 0,
      studyTimeHours: 0,
      badges: 0,
    },
    strengths: [],
    weaknesses: [],
    recommendations: [],
  };

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 800);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div>
      <AnalyticsDashboard
        studentName={user?.displayName || 'Your'}
        data={analyticsData}
      />
    </div>
  );
};

export default Analytics;
