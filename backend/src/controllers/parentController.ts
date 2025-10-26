import { Response } from 'express';
import { aiService } from '../services/aiService';
import { homeworkStore } from './homeworkController';

// Parent-child links storage
const childrenLinks: Map<string, string[]> = new Map();

export class ParentController {
  /**
   * Get parent dashboard overview
   */
  async getDashboard(req: any, res: Response): Promise<any> {
    try {
      const parentId = req.user?.userId;
      const children = childrenLinks.get(parentId) || [];

      // Get REAL homework for each linked child
      const overview = children.map(childId => {
        // Get all homework for this child
        const childHomework = Array.from(homeworkStore.values())
          .filter(hw => hw.studentId === childId);

        const completedHomework = childHomework.filter(hw => hw.status === 'completed').length;
        const pendingHomework = childHomework.filter(hw => hw.status === 'pending').length;

        // Get recent activity (last 5 homework items)
        const recentActivity = childHomework
          .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
          .slice(0, 5)
          .map(hw => ({
            type: hw.status === 'completed' ? 'homework_completed' : 'homework_assigned',
            title: hw.title,
            subject: hw.subject,
            status: hw.status,
            timestamp: hw.updatedAt,
          }));

        return {
          childId,
          name: 'Student', // You can add student names later from User table
          completedHomework,
          pendingHomework,
          totalHomework: childHomework.length,
          recentActivity,
        };
      });

      const dashboardData = {
        totalChildren: children.length,
        overview,
      };

      res.json(dashboardData);
    } catch (error: any) {
      console.error('Get Parent Dashboard Error:', error);
      res.status(500).json({ error: error.message || 'Failed to get dashboard' });
    }
  }

  /**
   * Get detailed student insights
   */
  async getStudentInsights(req: any, res: Response): Promise<any> {
    try {
      const { studentId } = req.params;

      // Mock homework and quiz data
      const homeworkData = [
        { subject: 'Math', completed: true, score: 85 },
        { subject: 'Science', completed: true, score: 90 },
      ];
      const quizScores = [85, 90, 78, 92, 88];
      const subjects = ['Math', 'Science', 'English'];

      // Generate AI insights
      const insights = await aiService.generateInsights(
        homeworkData,
        quizScores,
        subjects
      );

      const detailedInsights = {
        studentId,
        period: 'Last 30 days',
        summary: {
          totalHomework: 20,
          completedHomework: 18,
          averageScore: 86,
          totalPoints: 540,
          badges: 12,
          studyTimeHours: 25,
        },
        performance: {
          strengths: insights.strengths,
          weaknesses: insights.weaknesses,
          trends: [
            { subject: 'Math', trend: 'improving', change: '+8%' },
            { subject: 'Science', trend: 'stable', change: '0%' },
            { subject: 'English', trend: 'needs_attention', change: '-5%' },
          ],
        },
        recommendations: insights.recommendations,
        recentAchievements: [
          {
            type: 'badge',
            title: 'Math Master',
            description: 'Completed 10 math assignments',
            earnedAt: new Date(),
          },
          {
            type: 'milestone',
            title: '500 Points Milestone',
            description: 'Reached 500 total points',
            earnedAt: new Date(),
          },
        ],
        concerns: [
          {
            area: 'English Writing',
            description: 'Scores declining in recent assignments',
            suggestion: 'Consider additional practice with creative writing exercises',
          },
        ],
      };

      res.json(detailedInsights);
    } catch (error: any) {
      console.error('Get Student Insights Error:', error);
      res.status(500).json({ error: error.message || 'Failed to get insights' });
    }
  }

  /**
   * Get progress reports
   */
  async getProgressReports(req: any, res: Response): Promise<any> {
    try {
      const { studentId } = req.params;
      const { period } = req.query;

      const report = {
        studentId,
        period: period || 'monthly',
        generatedAt: new Date(),
        academicProgress: {
          overallGrade: 'B+',
          gpa: 3.5,
          subjects: [
            {
              name: 'Mathematics',
              grade: 'A',
              percentage: 92,
              improvement: '+5%',
              teacher_comment: 'Excellent progress in algebra',
            },
            {
              name: 'Science',
              grade: 'A-',
              percentage: 88,
              improvement: '+2%',
              teacher_comment: 'Strong understanding of concepts',
            },
            {
              name: 'English',
              grade: 'B',
              percentage: 82,
              improvement: '-3%',
              teacher_comment: 'Needs more practice in essay writing',
            },
          ],
        },
        behavioralMetrics: {
          attendance: '95%',
          homeworkCompletionRate: '90%',
          averageStudyTimePerDay: '2.5 hours',
          focusScore: 85,
        },
        recommendations: [
          'Consider extra tutoring for English writing',
          'Excellent progress in Math - encourage advanced topics',
          'Maintain current study schedule',
        ],
      };

      res.json(report);
    } catch (error: any) {
      console.error('Get Progress Reports Error:', error);
      res.status(500).json({ error: error.message || 'Failed to get reports' });
    }
  }

  /**
   * Link child to parent account
   */
  async linkChild(req: any, res: Response): Promise<any> {
    try {
      const parentId = req.user?.userId;
      const { childId } = req.body;

      if (!childId) {
        return res.status(400).json({ error: 'Child ID is required' });
      }

      const children = childrenLinks.get(parentId) || [];
      if (!children.includes(childId)) {
        children.push(childId);
        childrenLinks.set(parentId, children);
      }

      res.json({
        message: 'Child linked successfully',
        linkedChildren: children,
      });
    } catch (error: any) {
      console.error('Link Child Error:', error);
      res.status(500).json({ error: error.message || 'Failed to link child' });
    }
  }

  /**
   * Get child's homework
   */
  async getChildHomework(req: any, res: Response): Promise<any> {
    try {
      const parentId = req.user?.userId;
      const { studentId } = req.params;

      // Check if parent has access to this child
      const children = childrenLinks.get(parentId) || [];
      if (!children.includes(studentId)) {
        return res.status(403).json({ error: 'You do not have access to this student' });
      }

      // Get all homework for this child
      const homework = Array.from(homeworkStore.values())
        .filter(hw => hw.studentId === studentId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      res.json({
        studentId,
        homework,
        total: homework.length,
      });
    } catch (error: any) {
      console.error('Get Child Homework Error:', error);
      res.status(500).json({ error: error.message || 'Failed to get homework' });
    }
  }

  /**
   * Get real-time notifications
   */
  async getNotifications(_req: any, res: Response): Promise<any> {
    try {
      const notifications = [
        {
          id: '1',
          type: 'homework_completed',
          studentName: 'John Doe',
          message: 'Completed Math Assignment',
          timestamp: new Date(),
          read: false,
        },
        {
          id: '2',
          type: 'achievement',
          studentName: 'John Doe',
          message: 'Earned "Science Star" badge',
          timestamp: new Date(),
          read: false,
        },
        {
          id: '3',
          type: 'concern',
          studentName: 'John Doe',
          message: 'Homework overdue: English Essay',
          timestamp: new Date(),
          read: false,
          priority: 'high',
        },
      ];

      res.json({ notifications });
    } catch (error: any) {
      console.error('Get Notifications Error:', error);
      res.status(500).json({ error: error.message || 'Failed to get notifications' });
    }
  }
}

export const parentController = new ParentController();
