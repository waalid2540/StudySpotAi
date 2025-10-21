import { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { useAuth } from '../contexts/AuthContext';

interface UserStats {
  homeworkCompleted: number;
  homeworkDue: number;
  quizzesCompleted: number;
  averageScore: number;
  totalPoints: number;
  studyTime: number; // in hours
  streak: number;
  achievements: any[];
  rank: number;
  level: number;
  completedToday: number;
}

export const useUserStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    homeworkCompleted: 0,
    homeworkDue: 0,
    quizzesCompleted: 0,
    averageScore: 0,
    totalPoints: 0,
    studyTime: 0,
    streak: 0,
    achievements: [],
    rank: 0,
    level: 1,
    completedToday: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      loadStats();
    }
  }, [user?.uid]);

  const loadStats = () => {
    if (!user?.uid) return;

    try {
      // Get stored stats
      const storedStats = storageService.getUserStats(user.uid);

      // Calculate homework stats
      const homework = storageService.getHomework(user.uid);
      const homeworkCompleted = homework.filter((h: any) => h.status === 'completed').length;
      const homeworkDue = homework.filter((h: any) => h.status === 'pending' || h.status === 'in_progress').length;

      // Calculate today's completions
      const today = new Date().toDateString();
      const completedToday = homework.filter((h: any) => {
        return h.status === 'completed' && new Date(h.completedAt || h.createdAt).toDateString() === today;
      }).length;

      // Get quiz results
      const quizResults = storageService.getQuizResults(user.uid);
      const quizzesCompleted = quizResults.length;

      // Calculate average score
      let averageScore = 0;
      if (quizResults.length > 0) {
        const totalScore = quizResults.reduce((sum: number, quiz: any) => sum + (quiz.score || 0), 0);
        averageScore = Math.round(totalScore / quizResults.length);
      }

      // Get study sessions
      const studySessions = storageService.getStudySessions(user.uid);
      const studyTime = studySessions.reduce((total: number, session: any) => {
        return total + (session.duration || 0);
      }, 0) / 3600; // Convert seconds to hours

      // Get achievements
      const achievements = storageService.getAchievements(user.uid);

      // Calculate points from homework and quizzes
      const homeworkPoints = homework.reduce((total: number, hw: any) => {
        return total + (hw.points || 0);
      }, 0);
      const quizPoints = quizResults.reduce((total: number, quiz: any) => {
        return total + (quiz.points || 0);
      }, 0);
      const achievementPoints = achievements.reduce((total: number, ach: any) => {
        return total + (ach.points || 0);
      }, 0);
      const totalPoints = homeworkPoints + quizPoints + achievementPoints;

      // Calculate level (every 100 points = 1 level)
      const level = Math.floor(totalPoints / 100) + 1;

      // Calculate streak (simplified - consecutive days with completions)
      const streak = storedStats.streak || 0;

      // Mock rank (would come from backend)
      const rank = totalPoints > 500 ? 1 : totalPoints > 300 ? 2 : totalPoints > 100 ? 3 : 0;

      setStats({
        homeworkCompleted,
        homeworkDue,
        quizzesCompleted,
        averageScore,
        totalPoints,
        studyTime: Math.round(studyTime * 10) / 10, // Round to 1 decimal
        streak,
        achievements,
        rank,
        level,
        completedToday,
      });

      // Update stored stats
      storageService.updateUserStats(user.uid, {
        homeworkCompleted,
        quizzesCompleted,
        averageScore,
        totalPoints,
        studyTime,
        level,
      });

    } catch (error) {
      console.error('Failed to load user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = () => {
    loadStats();
  };

  const incrementHomework = () => {
    setStats((prev) => ({
      ...prev,
      homeworkCompleted: prev.homeworkCompleted + 1,
      homeworkDue: Math.max(0, prev.homeworkDue - 1),
      completedToday: prev.completedToday + 1,
    }));
    setTimeout(refreshStats, 100);
  };

  const incrementQuiz = (score: number, points: number) => {
    setStats((prev) => ({
      ...prev,
      quizzesCompleted: prev.quizzesCompleted + 1,
      totalPoints: prev.totalPoints + points,
      averageScore: Math.round(
        (prev.averageScore * prev.quizzesCompleted + score) / (prev.quizzesCompleted + 1)
      ),
    }));
    setTimeout(refreshStats, 100);
  };

  const addPoints = (points: number) => {
    setStats((prev) => ({
      ...prev,
      totalPoints: prev.totalPoints + points,
      level: Math.floor((prev.totalPoints + points) / 100) + 1,
    }));
    setTimeout(refreshStats, 100);
  };

  const addStudyTime = (seconds: number) => {
    setStats((prev) => ({
      ...prev,
      studyTime: Math.round((prev.studyTime + seconds / 3600) * 10) / 10,
    }));
    setTimeout(refreshStats, 100);
  };

  return {
    stats,
    loading,
    refreshStats,
    incrementHomework,
    incrementQuiz,
    addPoints,
    addStudyTime,
  };
};
