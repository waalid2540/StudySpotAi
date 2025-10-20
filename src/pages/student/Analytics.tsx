import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AnalyticsDashboard from '../../components/AnalyticsDashboard';
import { Loader2 } from 'lucide-react';

const Analytics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // Mock data - in production, this would come from API
  const analyticsData = {
    performanceOverTime: [
      { date: 'Week 1', score: 75 },
      { date: 'Week 2', score: 78 },
      { date: 'Week 3', score: 82 },
      { date: 'Week 4', score: 85 },
      { date: 'Week 5', score: 88 },
      { date: 'Week 6', score: 90 },
    ],
    subjectPerformance: [
      { subject: 'Math', score: 92, homework: 15 },
      { subject: 'Science', score: 88, homework: 12 },
      { subject: 'English', score: 82, homework: 18 },
      { subject: 'History', score: 86, homework: 10 },
      { subject: 'Physics', score: 90, homework: 8 },
    ],
    weeklyActivity: [
      { day: 'Mon', hours: 3 },
      { day: 'Tue', hours: 2.5 },
      { day: 'Wed', hours: 4 },
      { day: 'Thu', hours: 2 },
      { day: 'Fri', hours: 3.5 },
      { day: 'Sat', hours: 2 },
      { day: 'Sun', hours: 1.5 },
    ],
    summary: {
      totalHomework: 63,
      completedHomework: 58,
      averageScore: 87,
      totalPoints: 540,
      studyTimeHours: 18.5,
      badges: 12,
    },
    strengths: [
      'Consistent homework completion',
      'Strong performance in Math and Physics',
      'Regular study habits',
      'Excellent problem-solving skills',
    ],
    weaknesses: [
      'English writing needs more practice',
      'History assignments sometimes late',
      'Could benefit from more review time',
    ],
    recommendations: [
      'Consider joining a writing workshop for English',
      'Set earlier deadlines for History assignments',
      'Practice with additional Math problems to maintain strength',
      'Great job! Keep up the excellent work in Physics',
    ],
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
